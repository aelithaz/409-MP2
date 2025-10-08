// src/pages/GalleryView.tsx
import React, { useMemo, useState } from "react";
import { usePhotos } from "../context/PhotosContext";
import { Link } from "react-router-dom";
import styles from "../styles/pages.module.css";

export const GalleryView: React.FC = () => {
  const { photos } = usePhotos();
  const [selectedRovers, setSelectedRovers] = useState<string[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);

const rovers: string[] = Array.from(new Set(photos.map((p) => p.roverName)));
const cameras: string[] = Array.from(new Set(photos.map((p) => p.cameraName)));

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      if (selectedRovers.length && !selectedRovers.includes(p.roverName)) return false;
      if (selectedCameras.length && !selectedCameras.includes(p.cameraName)) return false;
      return true;
    });
  }, [photos, selectedRovers, selectedCameras]);

  function toggle(list: string[], setter: (s: string[]) => void, v: string) {
    if (list.includes(v)) setter(list.filter((x) => x !== v));
    else setter([...list, v]);
  }

  return (
    <div className={styles.container}>
      <h2>Gallery</h2>

      <div className={styles.filterRow}>
        <div>
          <strong>Rovers</strong>
          {rovers.map((r) => (
            <label key={r} className={styles.checkboxLabel}>
              <input type="checkbox" checked={selectedRovers.includes(r)} onChange={() => toggle(selectedRovers, setSelectedRovers, r)} />
              {r}
            </label>
          ))}
        </div>

        <div>
          <strong>Cameras</strong>
          {cameras.map((c) => (
            <label key={c} className={styles.checkboxLabel}>
              <input type="checkbox" checked={selectedCameras.includes(c)} onChange={() => toggle(selectedCameras, setSelectedCameras, c)} />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/details/${p.id}`}
            state={{ list: filtered.map((x) => x.id) }}
            className={styles.card}
          >
            <img src={p.imgSrc} alt={p.cameraFullName} className={styles.cardImg} />
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>{p.cameraFullName}</div>
              <div className={styles.small}>{p.earthDate} — sol {p.sol}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};