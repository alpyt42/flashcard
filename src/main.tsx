import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <App />
  </StrictMode>,
);
