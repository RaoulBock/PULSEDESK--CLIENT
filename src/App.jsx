import React from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  return <h1>Hello World from React and Electron!</h1>;
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
