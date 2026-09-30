import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Ticket, LocationCoordinates } from '../types';

interface BengaluruMapProps {
  tickets: Ticket[];
  selectedTicketId?: string | null;
  onSelectTicket: (ticket: Ticket) => void;
  // For Pin Drop mode in report modal
  isPinDropMode?: boolean;
  pinLocation?: LocationCoordinates | null;
  onLocationSelect?: (coords: LocationCoordinates) => void;
  centerLocation?: LocationCoordinates;
  zoomLevel?: number;
  heightClass?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pothole: { bg: '#d97706', border: '#b45309', text: '#ffffff' },
  streetlight: { bg: '#eab308', border: '#ca8a04', text: '#1e293b' },
  water_leak: { bg: '#0284c7', border: '#0369a1', text: '#ffffff' },
  open_drain: { bg: '#e11d48', border: '#be123c', text: '#ffffff' },
  garbage: { bg: '#059669', border: '#047857', text: '#ffffff' },
};

const CATEGORY_EMOJI: Record<string, string> = {
  pothole: '🕳️',
  streetlight: '💡',
  water_leak: '💧',
  open_drain: '⚠️',
  garbage: '🗑️',
};

export const BengaluruMap: React.FC<BengaluruMapProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  isPinDropMode = false,
  pinLocation,
  onLocationSelect,
  centerLocation = { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
  zoomLevel = 12,
  heightClass = 'h-[460px] md:h-[560px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pinDropMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Reset container if previously tagged by Leaflet in StrictMode
    if ((mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id) {
      delete (mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [centerLocation.lat, centerLocation.lng],
      zoom: zoomLevel,
      zoomControl: true,
      attributionControl: true,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CivicPulse Bengaluru',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map click handler for pin drop mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPinDropMode && onLocationSelect) {
        onLocationSelect({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPinDropMode, onLocationSelect]);

  // Handle pin drop marker updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pinLocation && isPinDropMode) {
      if (pinDropMarkerRef.current) {
        pinDropMarkerRef.current.setLatLng([pinLocation.lat, pinLocation.lng]);
      } else {
        const pinHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: #ef4444;
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            animation: bounce 1s infinite alternate;
          ">
            <span style="transform: rotate(45deg); font-size: 16px; font-weight: bold; color: white;">📍</span>
          </div>
        `;

        const customPinIcon = L.divIcon({
          html: pinHtml,
          className: 'pin-drop-marker',
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

        const newMarker = L.marker([pinLocation.lat, pinLocation.lng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        newMarker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          if (onLocationSelect) {
            onLocationSelect({
              lat: Number(position.lat.toFixed(5)),
              lng: Number(position.lng.toFixed(5)),
            });
          }
        });

        pinDropMarkerRef.current = newMarker;
      }
    } else if (!isPinDropMode && pinDropMarkerRef.current) {
      pinDropMarkerRef.current.remove();
      pinDropMarkerRef.current = null;
    }
  }, [pinLocation, isPinDropMode, onLocationSelect]);

  // Render tickets markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || isPinDropMode) return;

    markersLayer.clearLayers();

    tickets.forEach((ticket) => {
      const isSelected = ticket.id === selectedTicketId;
      const isResolved = ticket.status === 'Resolved';
      const color = CATEGORY_COLORS[ticket.category] || { bg: '#475569', border: '#1e293b', text: '#fff' };
      const emoji = CATEGORY_EMOJI[ticket.category] || '📍';

      // Badge for severity
      const severityBorder =
        ticket.severity === 'High'
          ? 'ring-4 ring-rose-500/80'
          : ticket.severity === 'Medium'
          ? 'ring-2 ring-amber-500/60'
          : 'ring-1 ring-slate-400';

      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-115'}" style="width: 36px; height: 36px;">
          <div style="
            width: 36px; 
            height: 36px; 
            background: ${isResolved ? '#10b981' : color.bg}; 
            border: 2.5px solid #ffffff; 
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          " class="${severityBorder}">
            <span style="font-size: 16px;">${isResolved ? '✅' : emoji}</span>
          </div>
          ${
            ticket.duplicateCount > 0
              ? `<div style="
                  position: absolute;
                  top: -4px;
                  right: -4px;
                  background: #ef4444;
                  color: white;
                  font-size: 9px;
                  font-weight: 800;
                  padding: 1px 4px;
                  border-radius: 9999px;
                  border: 1.5px solid white;
                ">+${ticket.duplicateCount}</div>`
              : ''
          }
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'civic-marker-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([ticket.coordinates.lat, ticket.coordinates.lng], { icon });

      // Marker Popup
      const popupHtml = `
        <div style="font-family: inherit; max-width: 240px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #64748b; font-family: monospace;">${ticket.ticketNumber}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${
              ticket.status === 'Resolved' ? '#dcfce7; color: #166534;' : '#fef3c7; color: #92400e;'
            }">${ticket.status}</span>
          </div>
          <p style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3;">
            ${ticket.title}
          </p>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            📍 ${ticket.landmark} (${ticket.ward})
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span style="font-size: 10px; font-weight: 600; color: #dc2626;">
              ${ticket.severity} Severity
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #2563eb;">
              ▲ ${ticket.upvotes} Upvotes
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { offset: [0, -10] });

      marker.on('click', () => {
        onSelectTicket(ticket);
      });

      markersLayer.addLayer(marker);
    });
  }, [tickets, selectedTicketId, isPinDropMode, onSelectTicket]);

  // Center on selected ticket if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedTicketId) return;

    const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
    if (selectedTicket) {
      map.flyTo([selectedTicket.coordinates.lat, selectedTicket.coordinates.lng], 14, {
        duration: 1.2,
      });
    }
  }, [selectedTicketId, tickets]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* Map Legend Overlay */}
      {!isPinDropMode && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs">
          <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Bengaluru Ward Infrastructure Live Pins</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> High Severity
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved
            </span>
          </div>
        </div>
      )}

      {/* Pin Drop Mode Helper Banner */}
      {isPinDropMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 shadow-lg text-xs flex items-center gap-2">
          <span className="text-amber-400 font-bold">📍 Pin Mode Active:</span>
          <span>Click anywhere on Bengaluru map to drop exact fault coordinates</span>
        </div>
      )}
    </div>
  );
};
