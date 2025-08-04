import React, { useState } from "react";

const { ipcRenderer } = window.require("electron");

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
  inputFocus: {
    borderColor: "#0078D7",
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
  },
  buttonHover: {
    backgroundColor: "#005a9e",
  },
  welcomeText: {
    textAlign: "center",
    color: "#0078D7",
  },
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [hover, setHover] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
    ipcRenderer.send("user:login");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    ipcRenderer.send("user:logout");
  };

  return (
    <div style={styles.container}>
      {!loggedIn ? (
        <>
          <h2 style={styles.heading}>Login</h2>
          <input
            type="text"
            placeholder="Username"
            style={styles.input}
            onFocus={(e) =>
              (e.target.style.borderColor = styles.inputFocus.borderColor)
            }
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            onFocus={(e) =>
              (e.target.style.borderColor = styles.inputFocus.borderColor)
            }
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
          <button
            style={{ ...styles.button, ...(hover ? styles.buttonHover : {}) }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={handleLogin}
          >
            Log In
          </button>
        </>
      ) : (
        <>
          <h2 style={styles.welcomeText}>Welcome! You're logged in.</h2>
          <button
            style={{
              ...styles.button,
              marginTop: 20,
              ...(hover ? styles.buttonHover : {}),
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </>
      )}
    </div>
  );
}
