// src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

// PUBLIC_URL is "" in dev, "/mp2" when CRA build reads "homepage" in package.json
const basename = process.env.PUBLIC_URL || "/";

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);