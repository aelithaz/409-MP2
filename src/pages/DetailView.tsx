// src/pages/DetailView.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePhotos } from "../context/PhotosContext";
import { getMarsPhotos } from "../api/nasa";
import { MarsPhoto } from "../types";
import styles from "../styles/pages.module.css";

export const DetailView: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { photos, setPhotos } = usePhotos();

  const [item, setItem] = useState<MarsPhoto | null>(null);
  const [loading, setLoading] = useState(false);

  // Try to find the item in context
  const findInContext = (id: string | undefined) => {
    if (!id) return null;
    return photos.find((p) => String(p.id) === String(id)) || null;
  };

  // Whenever the route param OR photos context changes, update `item`.
  // If not found in context, run the fallback fetch (keeps deep-link working).
  useEffect(() => {
    let mounted = true;
    const id = itemId;
    const fromCtx = findInContext(id);
    if (fromCtx) {
      setItem(fromCtx);
      return () => { mounted = false; };
    }

    // fallback: fetch a page and try to resolve the id
    const tryLoad = async () => {
      setLoading(true);
      try {
        const raw = await getMarsPhotos({ sol: 1000, page: 1 });
        const normalized = raw.map((r) => ({
          id: r.id,
          sol: r.sol,
          cameraName: r.camera.name,
          cameraFullName: r.camera.full_name,
          imgSrc: r.img_src,
          earthDate: r.earth_date,
          roverName: r.rover.name,
        }));
        if (!mounted) return;
        setPhotos(normalized);
        const found = normalized.find((p) => String(p.id) === String(id));
        if (found) setItem(found);
      } catch (e) {
        console.error("Detail fallback fetch failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    tryLoad();
    return () => { mounted = false; };
    // want to re-run when itemId or photos change
  }, [itemId, photos, setPhotos]);

  if (!item && !loading) return <div className={styles.container}>Item not found</div>;
  if (!item || loading) return <div className={styles.container}>Loading...</div>;

  // Prefer router state.list (passed from List/Gallery Link). If not present, use photos context order.
  const stateList = (location.state as { list?: (number | string)[] } | undefined)?.list;
  const listIdsFromContext = photos.map((p) => p.id);
  const listIds: (number | string)[] =
    Array.isArray(stateList) && stateList.length > 0 ? stateList : (listIdsFromContext.length > 0 ? listIdsFromContext : [item.id]);

  const idx = listIds.findIndex((id) => String(id) === String(item.id));

  // compute prev/next ids and disabled flags
  let prevId: number | string | null = null;
  let nextId: number | string | null = null;
  if (idx !== -1) {
    prevId = idx > 0 ? listIds[idx - 1] : null;
    nextId = idx < listIds.length - 1 ? listIds[idx + 1] : null;
  } else {
    // fallback: try to find in context order
    const ctxIdx = listIdsFromContext.findIndex((id) => String(id) === String(item.id));
    prevId = ctxIdx > 0 ? listIdsFromContext[ctxIdx - 1] : null;
    nextId = ctxIdx >= 0 && ctxIdx < listIdsFromContext.length - 1 ? listIdsFromContext[ctxIdx + 1] : null;
  }

  // navigate but preserve the list state so further Prev/Next keep working
  const goToId = (id: number | string | null) => {
    if (!id) return;
    navigate(`/details/${id}`, { state: { list: listIds } });
  };

  return (
    <div className={styles.container}>
      <h2>Details</h2>
      <div className={styles.detailRow}>
        <img src={item.imgSrc} alt={item.cameraFullName} className={styles.detailImg} />
        <div className={styles.detailMeta}>
          <h3>{item.cameraFullName}</h3>
          <p><strong>Rover:</strong> {item.roverName}</p>
          <p><strong>Earth date:</strong> {item.earthDate}</p>
          <p><strong>Sol:</strong> {item.sol}</p>
          <p><strong>Camera:</strong> {item.cameraName}</p>

          <div className={styles.buttonRow}>
            <button className={styles.button} disabled={!prevId} onClick={() => goToId(prevId)}>Previous</button>
            <button className={styles.button} disabled={!nextId} onClick={() => goToId(nextId)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
