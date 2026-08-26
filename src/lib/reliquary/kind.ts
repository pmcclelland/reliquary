import type { ArtifactKind } from "./types";

export function inferKind(html: string): ArtifactKind {
  if (
    /react(?:dom)?|text\/babel|from ['"]react['"]|@babel\/standalone|type=["']text\/jsx["']/i.test(
      html,
    )
  ) {
    return "react";
  }
  return "html";
}
