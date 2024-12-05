"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MapContext } from "@/components/dashboard/MapContext";
import { SidebarProvider } from "@/components/dashboard/sidebar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox styles
import { useEffect, useRef, useState } from "react";

// Load Access Token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [149.13, -35.28],
      zoom: 10,
    });

    // Add zoom and rotation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Save map instance to state
    setMapInstance(map);

    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    if (markerRef.current && orientation !== null) {
      markerRef.current.setRotation(orientation);
    }
  }, [orientation]);

  const { getLocation } = useGeolocation((position) => {
    const { latitude, longitude } = position.coords;

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });

      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="15,0 30,15 15,30 12,30 12,15 0,15 0,12 12,12 12,0" fill="blue" />
                </svg>
            `;

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker(markerElement)
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);
    }
  });

  const handleLocationClick = async () => {
    cleanupRef.current?.();
    await startWatching();
    cleanupRef.current = getLocation();
  };

  return (
    <MapContext.Provider value={mapInstance}>
      <div className="relative h-screen w-screen">
        {/* Map container */}
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Sidebar overlay */}
        <div className="absolute top-0 left-0 h-full w-[300px] bg-transparent z-10">
          <SidebarProvider>
            <AppSidebar />
          </SidebarProvider>
        </div>
      </div>
    </MapContext.Provider>
  );
}
