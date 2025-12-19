import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./accessibility.css";
import "./animations.css";
import "./button-effects.css";
import { setupErrorTracking } from "./services/logger";

// Initialize error tracking
setupErrorTracking();

createRoot(document.getElementById("root")!).render(<App />);
