// src/App.tsx
import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { PhotosProvider } from "./context/PhotosContext";
import { ListView } from "./pages/ListView";
import { GalleryView } from "./pages/GalleryView";
import { DetailView } from "./pages/DetailView";
import styles from "./App.module.css";

/**
 * App shows:
 *  - header / welcome message at top
 *  - chooser (List / Gallery) right below header
 *  - default route redirects to /list
 *  - detail route remains /details/:itemId
 */

function AppInner() {
  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>NASA Mars Photos</h1>
          <p className={styles.welcome}>Welcome! Browse Mars rover photos. Use the buttons to pick a view.</p>
        </div>

        {/* chooser (List / Gallery) */}
        <nav className={styles.chooser} aria-label="Choose view">
          <NavLink
            to="/list"
            className={({ isActive }) => (isActive ? `${styles.chooserButton} ${styles.active}` : styles.chooserButton)}
            end
          >
            List
          </NavLink>

          <NavLink
            to="/gallery"
            className={({ isActive }) => (isActive ? `${styles.chooserButton} ${styles.active}` : styles.chooserButton)}
          >
            Gallery
          </NavLink>
        </nav>
      </header>

      <main className={styles.main}>
        <Routes>
          {/* default to list */}
          <Route path="/" element={<Navigate to="/list" replace />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/details/:itemId" element={<DetailView />} />
          {/* fallback: redirect to list */}
          <Route path="*" element={<Navigate to="/list" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <PhotosProvider>
      <AppInner />
    </PhotosProvider>
  );
}

export default App;