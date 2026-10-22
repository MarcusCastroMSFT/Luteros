"use client";

// A client component keeps the current year out of the prerendered (cached) HTML of server layouts.
export function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
}
