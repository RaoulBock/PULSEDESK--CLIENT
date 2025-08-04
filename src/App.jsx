import React, { useState } from "react";
const { ipcRenderer } = window.require("electron");

const os = window.require("os");
const dns = window.require("dns");
const https = window.require("https");

const styles = {
  container: {
    maxWidth: 400,
    margin: "80px auto",
    padding: 30,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    borderRadius: 10,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#fff",
  },
  heading: {
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s",
  },
  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#0078D7",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: 10,
  },
  welcomeText: {
    textAlign: "center",
    color: "#0078D7",
  },
};

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

  const fetchData = () => {
    const hostname = os.hostname();

    const interfaces = os.networkInterfaces();
    let privateIP = "Not found";

    for (let name in interfaces) {
      for (let iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          privateIP = iface.address;
        }
      }
    }

    https
      .get("https://api.ipify.org", (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log("Hostname:", hostname);
          console.log("Private IP:", privateIP);
          console.log("Public IP:", data);
        });
      })
      .on("error", (err) => {
        console.error("Error fetching public IP:", err.message);
      });
  };

  return (
    <div style={styles.container}>
      {!loggedIn ? (
        <>
          <h2 style={styles.heading}>Login</h2>
          <input type="text" placeholder="Username" style={styles.input} />
          <input type="password" placeholder="Password" style={styles.input} />
          <button style={styles.button} onClick={handleLogin}>
            Log In
          </button>
        </>
      ) : (
        <>
          <h2 style={styles.welcomeText}>Welcome! You're logged in.</h2>
          <button style={styles.button} onClick={fetchData}>
            Fetch Data
          </button>
          <button style={styles.button} onClick={handleLogout}>
            Log Out
          </button>
        </>
      )}
    </div>
  );
}
