"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [40.7128, -74.006];

// Fix Leaflet default icon in Next.js
function fixLeafletIcon() {
  if (typeof window === "undefined") return;
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ lat, lng, onLocationSelect }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) fixLeafletIcon();
  }, [mounted]);

  const hasLocation = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
  const center = hasLocation ? [lat, lng] : DEFAULT_CENTER;

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocationSelect(pos.coords.latitude, pos.coords.longitude),
      () => alert("Could not get your location. Please click on the map to set it.")
    );
  }

  if (!mounted) {
    return (
      <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Location (optional)</span>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="text-xs text-primary hover:text-primary/80 font-medium"
        >
          Use my location
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Click on the map to pin the issue location</p>
      <div className="h-64 rounded-lg overflow-hidden border border-border z-0">
        <MapContainer
          center={center}
          zoom={hasLocation ? 15 : 10}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onLocationSelect} />
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
