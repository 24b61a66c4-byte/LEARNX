"use client";

import { useRef } from "react";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useClientSnapshot<T>(getSnapshot: () => T, getServerSnapshot: () => T) {
  const clientCache = useRef<{ key: string; value: T } | null>(null);
  const serverCache = useRef<{ key: string; value: T } | null>(null);

  function getCachedValue(source: "client" | "server") {
    const nextValue = source === "client" ? getSnapshot() : getServerSnapshot();
    const nextKey = JSON.stringify(nextValue);
    const cache = source === "client" ? clientCache : serverCache;

    if (cache.current?.key === nextKey) {
      return cache.current.value;
    }

    cache.current = {
      key: nextKey,
      value: nextValue,
    };

    return nextValue;
  }

  return useSyncExternalStore(subscribe, () => getCachedValue("client"), () => getCachedValue("server"));
}
