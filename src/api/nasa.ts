// src/api/nasa.ts
import axios from "axios";
import { MarsPhotoRaw } from "../types";

const API_KEY = process.env.REACT_APP_NASA_API_KEY || "";

const nasa = axios.create({
  baseURL: "https://api.nasa.gov",
  params: {
    api_key: API_KEY,
  },
  timeout: 15000,
});

// single-page fetch (existing)
export async function getMarsPhotos({
  rover = "curiosity",
  sol,
  earth_date,
  page = 1,
}: {
  rover?: string;
  sol?: number;
  earth_date?: string;
  page?: number;
}): Promise<MarsPhotoRaw[]> {
  const params: any = { page };
  if (sol !== undefined) params.sol = sol;
  if (earth_date !== undefined) params.earth_date = earth_date;
  const res = await nasa.get(`/mars-photos/api/v1/rovers/${rover}/photos`, { params });
  return res.data.photos as MarsPhotoRaw[];
}

// expanded fetch across sols/rovers/pages
export async function getMarsPhotosExpanded({
  rovers = ["curiosity"],
  sols = [] as number[],            // list of sol numbers to fetch (optional)
  earth_dates = [] as string[],    // or list of earth_date strings (YYYY-MM-DD)
  maxPages = 3,                    // limit pages per (rover,sol/date)
  maxRequests = 60,                // safety cap to avoid too many requests
}: {
  rovers?: string[];
  sols?: number[];
  earth_dates?: string[];
  maxPages?: number;
  maxRequests?: number;
}): Promise<MarsPhotoRaw[]> {
  const out: MarsPhotoRaw[] = [];
  let requests = 0;

  // helper to fetch by sol or earth_date
  const fetchFor = async (rover: string, opts: { sol?: number; earth_date?: string }) => {
    for (let page = 1; page <= maxPages; page++) {
      if (requests >= maxRequests) return;
      requests++;
      const params: any = { page };
      if (opts.sol !== undefined) params.sol = opts.sol;
      if (opts.earth_date !== undefined) params.earth_date = opts.earth_date;
      try {
        const res = await nasa.get(`/mars-photos/api/v1/rovers/${rover}/photos`, { params });
        const photos: MarsPhotoRaw[] = res.data.photos || [];
        if (!photos.length) break; // no more pages for this query
        out.push(...photos);
      } catch (err) {
        // non-fatal: stop paging this query on error
        console.warn("Error fetching", rover, opts, "page", page, err);
        break;
      }
    }
  };

  // fetch by sols
  for (const rover of rovers) {
    if (sols.length) {
      for (const s of sols) {
        if (requests >= maxRequests) break;
        await fetchFor(rover, { sol: s });
      }
    }
    if (earth_dates.length) {
      for (const d of earth_dates) {
        if (requests >= maxRequests) break;
        await fetchFor(rover, { earth_date: d });
      }
    }
  }

  // deduplicate by id (photos from multiple queries may overlap)
  const map = new Map<number, MarsPhotoRaw>();
  for (const p of out) map.set(p.id, p);
  return Array.from(map.values());
}