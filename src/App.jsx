import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require("electron");

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    ipcRenderer.on("user:logout", () => {
      setLoggedIn(false);
      setSystemData(null);
      setLoading(false);
    });

    ipcRenderer.on("system:data", (_, data) => {
      setSystemData(data);
      setLoading(false);
    });

    ipcRenderer.on("system:fetching", () => {
      setLoading(true);
    });

    ipcRenderer.on("user:login:success", () => {
      setLoggedIn(true);
      setUsername("");
      setPassword("");
    });

    ipcRenderer.on("user:login:failed", () => {
      alert("Login failed. Please check your credentials.");
    });

    return () => {
      ipcRenderer.removeAllListeners("user:logout");
      ipcRenderer.removeAllListeners("system:data");
      ipcRenderer.removeAllListeners("system:fetching");
      ipcRenderer.removeAllListeners("user:login:success");
      ipcRenderer.removeAllListeners("user:login:failed");
    };
  }, []);

  const handleLogin = () => {
    ipcRenderer.send("user:login", { username, password });
    // setLoggedIn(true);
  };

  const handleLogout = () => {
    ipcRenderer.send("user:logout");
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 800 }}>
      <h1>🏢 Corp Machine Info</h1>
      {!loggedIn ? (
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", marginBottom: 20, width: "100%" }}
          />
          <button onClick={handleLogin}>🔐 Login</button>
        </div>
      ) : (
        <>
          <button onClick={handleLogout}>🚪 Logout</button>
          <h2 style={{ marginTop: 30 }}>🖥️ System Information:</h2>
          {loading ? (
            <p>Fetching latest system info</p>
          ) : systemData ? (
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
            <p>Loading system info ...</p>
          )}
        </>
      )}
    </div>
  );
}
