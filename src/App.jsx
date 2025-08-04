import React, { useState } from "react";

const { ipcRenderer } = window.require("electron");

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
    ipcRenderer.send("user:login");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    ipcRenderer.send("user:logout");
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      {!loggedIn ? (
        <>
          <h2>Login</h2>
          <input
            placeholder="Username"
            style={{ display: "block", marginBottom: 10 }}
          />
          <input
            placeholder="Password"
            type="password"
            style={{ display: "block", marginBottom: 20 }}
          />
          <button onClick={handleLogin}>Log In</button>
        </>
      ) : (
        <>
          <h2>Welcome! You're logged in.</h2>
          <button onClick={handleLogout}>Log Out</button>
        </>
      )}
    </div>
  );
}
