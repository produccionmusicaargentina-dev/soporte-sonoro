import React from "react";
import ReactDOM from "react-dom/client";
import storage from "./db";
import App from "./App";

// Attach Firestore-backed storage to window.storage
// so the app code works identically to the artifact version
window.storage = storage;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
