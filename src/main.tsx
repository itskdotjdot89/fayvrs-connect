import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationTracker } from "./components/LocationTracker";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <LocationTracker />
    <App />
  </AuthProvider>
);
