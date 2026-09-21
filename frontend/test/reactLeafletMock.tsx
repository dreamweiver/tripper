import type { ReactNode } from "react";

// Test stub for react-leaflet. The real package ships ESM that ts-jest doesn't
// transform, and jsdom has no real map surface, so components that embed the
// map (e.g. PlannerScreen) mock it out. Children still render so any popup
// content is exercised; the map hook is a no-op the map controller can call.
export function MapContainer({ children }: { children?: ReactNode }) {
  return <div data-testid="map-container">{children}</div>;
}
export function TileLayer() {
  return null;
}
export function Marker({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function Popup({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function useMap() {
  return {
    invalidateSize: () => {},
    fitBounds: () => {},
    setView: () => {},
    getContainer: () => document.createElement("div"),
  };
}
