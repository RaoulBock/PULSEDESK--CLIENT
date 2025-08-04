import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [systemData, setSystemData] = useState(null);

  useEffect(() => {
    ipcRenderer.on("user:logout", () => setLoggedIn(false));
    ipcRenderer.on("system:data", (event, data) => setSystemData(data));
    return () => {
      ipcRenderer.removeAllListeners("user:logout");
      ipcRenderer.removeAllListeners("system:data");
    };
  }, []);

  const handleLogin = () => {
    ipcRenderer.send("user:login");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    ipcRenderer.send("user:logout");
    setSystemData(null);
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1>PulseDesk Client</h1>
      {!loggedIn ? (
        <button
          onClick={handleLogin}
          style={{ padding: "10px 20px", fontSize: 16 }}
        >
          Login
        </button>
      ) : (
        <>
          <button
            onClick={handleLogout}
            style={{ marginBottom: 20, padding: "10px 20px", fontSize: 16 }}
          >
            Logout
          </button>

          {systemData ? (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#f0f0f0",
                padding: 20,
                borderRadius: 8,
              }}
            >
              {JSON.stringify(systemData, null, 2)}
            </pre>
          ) : (
            <p>No system data received yet.</p>
          )}
        </>
      )}
    </div>
  );
}
