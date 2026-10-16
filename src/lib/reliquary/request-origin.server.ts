import { getRequest } from "@tanstack/react-start/server";

/** Public origin of the current request (honours proxy forwarding headers). */
export function requestOrigin(): string {
  const req = getRequest();
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || req.headers.get("host") || url.host;
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.startsWith("localhost") || host.startsWith("127.") ? url.protocol.replace(":", "") : "https");
  return `${proto}://${host}`;
}
