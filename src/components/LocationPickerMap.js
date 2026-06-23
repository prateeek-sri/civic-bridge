"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useTheme } from "next-themes";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.5937, 78.9629]; // India center instead of New York

// Fix Leaflet marker icon issue in Next.js
function fixLeafletIcon() {
  if (typeof window === "undefined") return;

  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Handle clicking on map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// This is what actually makes the map move
function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);

  return null;
}

export default function LocationPickerMap({ lat, lng, onLocationSelect }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    fixLeafletIcon();
  }, []);

  const hasLocation = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
  const center = hasLocation ? [lat, lng] : DEFAULT_CENTER;

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationSelect(latitude, longitude);
      },
      (err) => {
        alert("Location error: " + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-sm">
        Loading map...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Location (optional)
        </span>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="text-xs text-primary hover:text-primary/80 font-medium"
        >
          Use my location
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click on the map to pin the issue location
      </p>

      <div className="h-64 rounded-lg overflow-hidden border border-border z-0">
        <MapContainer
          center={center}
          zoom={hasLocation ? 15 : 5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={resolvedTheme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
          />

          <MapClickHandler onLocationSelect={onLocationSelect} />
          <RecenterMap lat={lat} lng={lng} />

          {hasLocation && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>

      {hasLocation && (
        <p className="text-xs text-muted-foreground">
          Selected: {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
        </p>
      )}
    </div>
  );
}
