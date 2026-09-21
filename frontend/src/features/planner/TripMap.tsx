import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchSearch } from "./api";
import { MapStopPopup } from "./MapStopPopup";
import styles from "./planner.module.scss";

export interface MapStop {
  id: string;
  number: number; // running stop number, matching the timeline spine
  title: string;
  nameEn?: string; // English equivalent of a local-language name, when known
  category?: string; // Nominatim/Overpass category, drives the chip + fallback image
  imageUrl?: string; // already-resolved thumbnail (from the planner card), if any
  lat: number;
  lon: number;
}

interface TripMapProps {
  stops: MapStop[]; // plottable places for the currently-open day
  destination: string; // fallback centre when the open day has no plotted stops
}

// Teal numbered pin drawn as inline HTML so it matches the timeline spine
// markers and sidesteps Leaflet's default-icon asset paths (which break under
// bundlers). Anchored at its centre.
function numberedIcon(n: number): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50%;background:#0d9488;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px #fff,0 1px 4px rgba(0,0,0,0.35)">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

// Imperatively keeps the viewport in sync with the current stops: fit to the
// pins when there are any, otherwise centre on the geocoded destination. Runs
// inside <MapContainer> so it can grab the Leaflet map via useMap().
function MapController({
  stops,
  destCenter,
}: {
  stops: MapStop[];
  destCenter: [number, number] | null;
}) {
  const map = useMap();
  // Fit the viewport to the current stops (or destination). We invalidateSize
  // first every time because Leaflet caches the container size, and in a flex
  // panel that cached size is stale on mount / while the mobile Map tab is
  // hidden — fitting against a stale size leaves pins panned off-screen.
  const fit = useCallback(() => {
    map.invalidateSize();
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    } else if (destCenter) {
      map.setView(destCenter, 12);
    }
  }, [map, stops, destCenter]);

  // Re-fit on mount and whenever the stops (day change) or destination change.
  useEffect(() => {
    fit();
  }, [fit]);

  // The ResizeObserver fires once on observe — catching the moment the panel
  // gets its real size after mount — and again on any later resize, re-fitting
  // so every pin stays in view.
  useEffect(() => {
    const ro = new ResizeObserver(() => fit());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map, fit]);
  return null;
}

export function TripMap({ stops, destination }: TripMapProps) {
  // Geocode the destination once, only while the open day has nothing to plot,
  // so the map still shows the right city instead of a blank world view.
  const [destCenter, setDestCenter] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (stops.length > 0) return;
    let cancelled = false;
    void (async () => {
      try {
        const [origin] = await fetchSearch(destination);
        if (!cancelled && origin) setDestCenter([origin.lat, origin.lon]);
      } catch {
        // Non-fatal: without a centre the map just shows a wide default view.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stops.length, destination]);

  // Initial view: first stop, else the geocoded destination, else a wide world
  // view. MapController refines this to a fitted bounds once mounted.
  const initial = useMemo<{ center: [number, number]; zoom: number }>(() => {
    if (stops[0]) return { center: [stops[0].lat, stops[0].lon], zoom: 13 };
    if (destCenter) return { center: destCenter, zoom: 12 };
    return { center: [20, 0], zoom: 2 };
    // Only the mount-time value matters; live updates go through MapController.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.mapRoot}>
      <MapContainer
        center={initial.center}
        zoom={initial.zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stops.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lon]} icon={numberedIcon(s.number)}>
            <Popup minWidth={200} maxWidth={260}>
              <MapStopPopup stop={s} />
            </Popup>
          </Marker>
        ))}
        <MapController stops={stops} destCenter={destCenter} />
      </MapContainer>
    </div>
  );
}
