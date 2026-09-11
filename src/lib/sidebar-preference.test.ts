import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applySidebarCollapsedAttr,
  readSidebarCollapsed,
  SIDEBAR_COLLAPSED_KEY,
  writeSidebarCollapsed,
} from "./sidebar-preference.ts";

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
    data,
  };
}

describe("sidebar preference", () => {
  it("treats missing and unknown values as expanded", () => {
    assert.equal(readSidebarCollapsed(memoryStore()), false);
    assert.equal(readSidebarCollapsed(memoryStore({ [SIDEBAR_COLLAPSED_KEY]: "0" })), false);
    assert.equal(readSidebarCollapsed(memoryStore({ [SIDEBAR_COLLAPSED_KEY]: "yes" })), false);
  });

  it("reads collapsed when stored as 1", () => {
    assert.equal(readSidebarCollapsed(memoryStore({ [SIDEBAR_COLLAPSED_KEY]: "1" })), true);
  });

  it("persists 1 and 0", () => {
    const store = memoryStore();
    writeSidebarCollapsed(true, store);
    assert.equal(store.data[SIDEBAR_COLLAPSED_KEY], "1");
    writeSidebarCollapsed(false, store);
    assert.equal(store.data[SIDEBAR_COLLAPSED_KEY], "0");
  });

  it("sets and clears the document data attribute", () => {
    const root = { dataset: {} as DOMStringMap };
    applySidebarCollapsedAttr(true, root);
    assert.equal(root.dataset.sidebarCollapsed, "true");
    applySidebarCollapsedAttr(false, root);
    assert.equal(root.dataset.sidebarCollapsed, undefined);
  });
});
