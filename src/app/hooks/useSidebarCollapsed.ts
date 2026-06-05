import { useEffect, useState } from "react";

const SIDEBAR_COLLAPSED_KEY = "app_sidebar_collapsed";
const SIDEBAR_EVENT = "sidebar_collapsed_changed";

function getInitialSidebarCollapsed() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsedState] = useState(getInitialSidebarCollapsed);

  const setIsCollapsed = (collapsed: boolean | ((prev: boolean) => boolean)) => {
    setIsCollapsedState((prev) => {
      const next = typeof collapsed === "function" ? collapsed(prev) : collapsed;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      window.dispatchEvent(new Event(SIDEBAR_EVENT));
      return next;
    });
  };

  useEffect(() => {
    const handleSync = () => {
      setIsCollapsedState(getInitialSidebarCollapsed());
    };

    window.addEventListener(SIDEBAR_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(SIDEBAR_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  return { isCollapsed, setIsCollapsed };
}
