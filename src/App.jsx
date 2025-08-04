import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require("electron");

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [systemData, setSystemData] = useState(null);

  useEffect(() => {
    ipcRenderer.on("user:logout", () => {
      setLoggedIn(false);
      setSystemData(null);
    });

    ipcRenderer.on("system:data", (_, data) => {
      setSystemData(data);
    });

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
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 800 }}>
      <h1>🏢 Corp Machine Info</h1>
      {!loggedIn ? (
        <button onClick={handleLogin}>🔐 Login</button>
      ) : (
        <>
          <button onClick={handleLogout}>🚪 Logout</button>
          <h2 style={{ marginTop: 30 }}>🖥️ System Information:</h2>
          {systemData ? (
            <div style={{ lineHeight: 1.6 }}>
              <p>
                <strong>Hostname:</strong> {systemData.hostname}
              </p>
              <p>
                <strong>Platform:</strong> {systemData.platform}
              </p>
              <p>
                <strong>OS Type:</strong> {systemData.osType}
              </p>
              <p>
                <strong>OS Release:</strong> {systemData.osRelease}
              </p>
              <p>
                <strong>Architecture:</strong> {systemData.architecture}
              </p>
              <p>
                <strong>Uptime:</strong> {Math.floor(systemData.uptime / 60)}{" "}
                mins
              </p>
              <p>
                <strong>Total Memory:</strong> {systemData.totalMemory}
              </p>
              <p>
                <strong>Free Memory:</strong> {systemData.freeMemory}
              </p>
              <p>
                <strong>CPU Count:</strong> {systemData.cpuCount}
              </p>
              <p>
                <strong>Public IP:</strong> {systemData.publicIP}
              </p>
              <p>
                <strong>Private IP(s):</strong>{" "}
                {systemData.privateIPs.join(", ")}
              </p>
              <p>
                <strong>CPU Models:</strong>
              </p>
              <ul>
                {systemData.cpus.map((cpu, idx) => (
                  <li key={idx}>{cpu}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Loading system info...</p>
          )}
        </>
      )}
    </div>
  );
}
