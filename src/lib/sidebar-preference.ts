import { useCallback, useLayoutEffect, useState } from "react";

export const SIDEBAR_ID = "reliquary-sidebar";
export const SIDEBAR_COLLAPSED_KEY = "reliquary-sidebar-collapsed";

type ReadableStore = Pick<Storage, "getItem">;
type WritableStore = Pick<Storage, "setItem">;

function browserStore(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function readSidebarCollapsed(storage?: ReadableStore | null): boolean {
  try {
    const store = storage === undefined ? browserStore() : storage;
    return store?.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(collapsed: boolean, storage?: WritableStore | null): void {
  try {
    const store = storage === undefined ? browserStore() : storage;
    store?.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // private mode
  }
}

export function applySidebarCollapsedAttr(
  collapsed: boolean,
  root?: { dataset: DOMStringMap } | null,
): void {
  const el =
    root === undefined ? (typeof document === "undefined" ? null : document.documentElement) : root;
  if (!el) return;
  if (collapsed) el.dataset.sidebarCollapsed = "true";
  else delete el.dataset.sidebarCollapsed;
}

export const sidebarBootstrapScript = `(function(){try{if(localStorage.getItem(${JSON.stringify(SIDEBAR_COLLAPSED_KEY)})==="1")document.documentElement.dataset.sidebarCollapsed="true";}catch(t){}})();`;

export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(false);

  useLayoutEffect(() => {
    const stored = readSidebarCollapsed();
    setCollapsedState(stored);
    applySidebarCollapsedAttr(stored);
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    writeSidebarCollapsed(next);
    applySidebarCollapsedAttr(next);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      writeSidebarCollapsed(next);
      applySidebarCollapsedAttr(next);
      return next;
    });
  }, []);

  return { collapsed, setCollapsed, toggleCollapsed };
}
