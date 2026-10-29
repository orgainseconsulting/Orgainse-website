import React from "react";
import { prerenderToNodeStream } from "react-dom/static";
import App from "./App";

export async function render(url) {
  const { prelude } = await prerenderToNodeStream(<App location={url} />, { progressiveChunkSize: Number.MAX_SAFE_INTEGER });
  let html = "";
  for await (const chunk of prelude) html += chunk;
  return html;
}
