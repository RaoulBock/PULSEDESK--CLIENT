import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    ipcRenderer.on("user:logout", () => setLoggedIn(false));
    return () => ipcRenderer.removeAllListeners("user:logout");
  }, []);

  const handleLogin = () => {
    ipcRenderer.send("user:login");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    ipcRenderer.send("user:logout");
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Welcome to the Corp Tool</h1>
      {!loggedIn ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <>
          <p>You are logged in.</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}
