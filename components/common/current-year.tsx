"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Reads the clock only in the browser: with Cache Components, a client component that
// calls `new Date()` while prerendering fails the build unless it sits under <Suspense>.
export function CurrentYear() {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => null);
  return <>{year}</>;
}
