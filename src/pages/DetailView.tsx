// src/pages/DetailView.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePhotos } from "../context/PhotosContext";
import { getMarsPhotos } from "../api/nasa";
import { MarsPhoto } from "../types";
import styles from "../styles/pages.module.css";

type LocationState = {
  list?: (number | string)[];
};

export const DetailView: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { photos, setPhotos } = usePhotos();

  const [item, setItem] = useState<MarsPhoto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Keep item in sync when route param or photos context changes.
  useEffect(() => {
    let mounted = true;
    const id = itemId ? String(itemId) : undefined;

    // Try to find in existing context first
    if (id) {
      const found = photos.find((p) => String(p.id) === id) || null;
      if (found) {
        setItem(found);
        return () => {
          mounted = false;
        };
      }
    }

    // Fallback: fetch a small set of photos to populate context and find the item
    const fetchFallback = async () => {
      setLoading(true);
      try {
        // Fetch a representative page (adjust sol/page as desired)
        const raw = await getMarsPhotos({ sol: 1000, page: 1 });
        const normalized: MarsPhoto[] = raw.map((r) => ({
          id: r.id,
          sol: r.sol,
          cameraName: r.camera.name,
          cameraFullName: r.camera.full_name,
          imgSrc: r.img_src,
          earthDate: r.earth_date,
          roverName: r.rover.name,
        }));
        if (!mounted) return;
        // update shared photos so Prev/Next can operate
        setPhotos(normalized);
        const found = normalized.find((p) => String(p.id) === String(id));
        if (found) setItem(found);
      } catch (err) {
        console.error("Detail fallback fetch failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFallback();

    return () => {
      mounted = false;
    };
    // re-run when itemId or photos change
  }, [itemId, photos, setPhotos]);

  if (!item && !loading) {
    return <div className={styles.container}>Item not found</div>;
  }
  if (!item || loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  // Decide ordered ID list to use for Prev/Next:
  const state = location.state as LocationState | undefined;
  const stateList = Array.isArray(state?.list) && state!.list!.length > 0 ? state!.list! : null;
  const listIdsFromContext = photos.map((p) => p.id);
  const listIds: (number | string)[] =
    stateList && stateList.length > 0 ? stateList : listIdsFromContext.length > 0 ? listIdsFromContext : [item.id];

  const idx = listIds.findIndex((id) => String(id) === String(item.id));

  let prevId: number | string | null = null;
  let nextId: number | string | null = null;

  if (idx !== -1) {
    prevId = idx > 0 ? listIds[idx - 1] : null;
    nextId = idx < listIds.length - 1 ? listIds[idx + 1] : null;
  } else {
    // fallback: use context ordering if possible
    const ctxIdx = listIdsFromContext.findIndex((id) => String(id) === String(item.id));
    prevId = ctxIdx > 0 ? listIdsFromContext[ctxIdx - 1] : null;
    nextId = ctxIdx >= 0 && ctxIdx < listIdsFromContext.length - 1 ? listIdsFromContext[ctxIdx + 1] : null;
  }

  // Navigate while preserving the current ordered list in location.state
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
          <p>
            <strong>Rover:</strong> {item.roverName}
          </p>
          <p>
            <strong>Earth date:</strong> {item.earthDate}
          </p>
          <p>
            <strong>Sol:</strong> {item.sol}
          </p>
          <p>
            <strong>Camera:</strong> {item.cameraName}
          </p>

          <div className={styles.buttonRow}>
            <button
              className={styles.button}
              onClick={() => goToId(prevId)}
              disabled={prevId === null}
              aria-label="Previous item"
            >
              Previous
            </button>

            <button
              className={styles.button}
              onClick={() => goToId(nextId)}
              disabled={nextId === null}
              aria-label="Next item"
            >
              Next
            </button>
          </div>

          <div className={styles.small} style={{ marginTop: 8 }}>
            {idx !== -1 ? `Viewing ${idx + 1} of ${listIds.length}` : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;