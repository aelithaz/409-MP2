// src/pages/ListView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getMarsPhotosExpanded } from "../api/nasa";
import { MarsPhotoRaw, MarsPhoto } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import { usePhotos } from "../context/PhotosContext";
import { Link } from "react-router-dom";
import styles from "../styles/pages.module.css";

type SortKey = "earthDate" | "sol" | "camera";

export const ListView: React.FC = () => {
  const { photos, setPhotos } = usePhotos();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [sortKey, setSortKey] = useState<SortKey>("earthDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // inside ListView.tsx useEffect (replace existing fetch)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Example: fetch 3 sols around sol 1000 for two rovers and up to 3 pages each
        const solsRange = Array.from({ length: 7 }, (_, i) => 1000 - 3 + i); // 997..1003
        const photosRaw = await getMarsPhotosExpanded({
          rovers: ["curiosity", "perseverance"], // choose rovers you want
          sols: solsRange,
          maxPages: 2,
          maxRequests: 40,
        });

        // typed normalize to your MarsPhoto type (minimal change to use imported types)
        const photosRawTyped = photosRaw as MarsPhotoRaw[];
        const normalized: MarsPhoto[] = photosRawTyped.map((r) => ({
          id: r.id,
          sol: r.sol,
          imgSrc: r.img_src,
          cameraName: r.camera.name,
          cameraFullName: r.camera.full_name,
          earthDate: r.earth_date,
          roverName: r.rover.name,
        }));

        if (!mounted) return;
        // you may want to sort by date/sol here, for example newest first:
        normalized.sort((a, b) => b.earthDate.localeCompare(a.earthDate));
        setPhotos(normalized);
        console.log("Loaded photos", normalized.length);
      } catch (e) {
        console.error("Failed to load expanded photos", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [setPhotos]);


  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let arr = photos.slice();
    if (q) {
      arr = arr.filter(
        (p) =>
          p.cameraFullName.toLowerCase().includes(q) ||
          p.cameraName.toLowerCase().includes(q) ||
          p.roverName.toLowerCase().includes(q) ||
          p.earthDate.includes(q)
      );
    }
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "earthDate") cmp = a.earthDate.localeCompare(b.earthDate);
      else if (sortKey === "sol") cmp = a.sol - b.sol;
      else cmp = a.cameraName.localeCompare(b.cameraName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [photos, debouncedQuery, sortKey, sortDir]);

  return (
    <div className={styles.container}>
      <h2>List View</h2>

      <div className={styles.controls}>
        <input
          className={styles.input}
          placeholder="filter by camera / rover / date..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select className={styles.select} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="earthDate">Earth date</option>
          <option value="sol">Sol (numeric)</option>
          <option value="camera">Camera</option>
        </select>

        <button className={styles.button} onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
          {sortDir === "asc" ? "Asc" : "Desc"}
        </button>
      </div>

      {loading && <div>Loading photos...</div>}

      <ul className={styles.list}>
        {filtered.map((p) => (
          <li key={p.id} className={styles.listItem}>
            <img src={p.imgSrc} alt={p.cameraFullName} className={styles.thumb} />
            <div className={styles.itemMeta}>
              <Link to={`/details/${p.id}`} state={{ list: filtered.map((x) => x.id) }} className={styles.link}>
                {p.cameraFullName}
              </Link>
              <div className={styles.small}>{p.earthDate} — sol {p.sol} — {p.roverName}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};