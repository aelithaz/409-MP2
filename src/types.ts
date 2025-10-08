// src/types.ts
export interface MarsPhotoRaw {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

// Minimal normalized type for the app
export interface MarsPhoto {
  id: number;
  sol: number;
  cameraName: string;
  cameraFullName: string;
  imgSrc: string;
  earthDate: string;
  roverName: string;
}