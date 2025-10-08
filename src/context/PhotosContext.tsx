// src/context/PhotosContext.tsx
import React, { createContext, useContext, useState } from "react";
import { MarsPhoto } from "../types";

interface PhotosContextValue {
  photos: MarsPhoto[];
  setPhotos: (p: MarsPhoto[]) => void;
}

const PhotosContext = createContext<PhotosContextValue | undefined>(undefined);

export const PhotosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  return <PhotosContext.Provider value={{ photos, setPhotos }}>{children}</PhotosContext.Provider>;
};

export function usePhotos(): PhotosContextValue {
  const ctx = useContext(PhotosContext);
  if (!ctx) throw new Error("usePhotos must be used inside PhotosProvider");
  return ctx;
}
