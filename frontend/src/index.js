import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const container = document.getElementById("root");
const tree = (
  <React.Fragment>
    <App />
  </React.Fragment>
);

// Prerendered pages ship real HTML in #root; hydrate it instead of wiping it.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  ReactDOM.createRoot(container).render(tree);
}
