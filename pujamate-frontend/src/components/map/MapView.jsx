'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { flattenStations } from '@/lib/metro-data';
import { BUS_ROUTES } from '@/lib/bus-data';

const CROWD_COLOR = { LOW: '#10B981', MODERATE: '#FFC000', HEAVY: '#E32636', UNKNOWN: '#900C3F' };
const FACILITY_ICON = { toilet: '🚻', medical: '🏥', parking: '🅿️', metro: '🚇', bus: '🚌', seniorSeating: '🪑' };
const DEFAULT_CENTER = [88.3639, 22.5726];
const ROUTE_SOURCE_ID = 'active-route';
const ROUTE_LAYER_ID = 'active-route-line';

function createPinElement(color, { size = 18, ring = false, icon = '' } = {}) {
  const el = document.createElement('div');
  el.style.width = `${size}px`; el.style.height = `${size}px`; el.style.borderRadius = '9999px';
  el.style.background = color; el.style.border = '2px solid white'; el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.justifyContent = 'center';
  el.style.fontSize = `${Math.max(9, size - 7)}px`; el.style.boxShadow = ring ? `0 0 0 3px ${color}55, 0 2px 7px rgba(0,0,0,.3)` : '0 2px 7px rgba(0,0,0,.3)';
  el.style.cursor = 'pointer'; el.textContent = icon; return el;
}

function createStopNumberElement(index, color) {
  const el = document.createElement('div');
  el.textContent = String(index + 1); el.style.width = '30px'; el.style.height = '30px'; el.style.borderRadius = '9999px'; el.style.background = color; el.style.color = 'white';
  el.style.fontFamily = 'var(--font-body-b), sans-serif'; el.style.fontSize = '11px'; el.style.fontWeight = '800'; el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.justifyContent = 'center'; el.style.border = '2px solid white'; el.style.boxShadow = '0 3px 10px rgba(0,0,0,.35)'; el.style.cursor = 'pointer'; return el;
}

function createFacilityBadgeElement(types) {
  const el = document.createElement('div');
  el.style.display = 'flex'; el.style.gap = '2px'; el.style.padding = '3px 5px'; el.style.borderRadius = '9999px'; el.style.background = 'rgba(255,255,255,.96)'; el.style.border = '1.5px solid #900C3F'; el.style.fontSize = '11px'; el.style.lineHeight = '1'; el.style.boxShadow = '0 2px 7px rgba(0,0,0,.22)'; el.style.pointerEvents = 'none'; el.textContent = types.map((t) => FACILITY_ICON[t] || '•').join(''); return el;
}

function staticPoiMarkers(activeFacilityTypes) {
  const markers = [];
  if (activeFacilityTypes.includes('metro')) {
    flattenStations().forEach((station) => markers.push({ id: `metro-${station.id}`, type: 'metro', name: station.name, line: station.lineName, latitude: station.lat, longitude: station.lng, icon: '🚇', color: '#2563EB' }));
  }
  if (activeFacilityTypes.includes('bus')) {
    const seen = new Set();
    BUS_ROUTES.forEach((route) => route.stops.forEach(([name, lat, lng]) => {
      const key = `${name}-${lat}-${lng}`;
      if (!seen.has(key)) { seen.add(key); markers.push({ id: `bus-${key}`, type: 'bus', name, line: route.name, latitude: lat, longitude: lng, icon: '🚌', color: '#D97706' }); }
    }));
  }
  return markers;
}

export default function MapView({ pujas = [], routeStops = null, routeStart = null, routeEnd = null, routeGeometry = null, focusPuja = null, facilityMarkers = [], activeFacilityTypes = [], userLocation = null, onMarkerClick, onStaticPoiClick, regionCenter = DEFAULT_CENTER, regionZoom = 11.5, className = 'h-[620px] w-full overflow-hidden rounded-2xl' }) {
  const containerRef = useRef(null); const mapRef = useRef(null); const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; mapboxgl.accessToken = token || '';
    const map = new mapboxgl.Map({ container: containerRef.current, style: 'mapbox://styles/mapbox/light-v11', center: userLocation ? [userLocation.longitude, userLocation.latitude] : regionCenter, zoom: userLocation ? 13 : regionZoom });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false, showUserHeading: false }), 'top-right');
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (mapRef.current && regionCenter) mapRef.current.flyTo({ center: regionCenter, zoom: regionZoom, duration: 700 });
  }, [regionCenter, regionZoom]);

  useEffect(() => {
    if (mapRef.current && userLocation) mapRef.current.flyTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 13, duration: 700 });
  }, [userLocation]);

  useEffect(() => {
    if (mapRef.current && focusPuja) {
      mapRef.current.flyTo({ center: [Number(focusPuja.longitude), Number(focusPuja.latitude)], zoom: 15, duration: 650 });
    }
  }, [focusPuja]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const render = () => {
      markersRef.current.forEach((m) => m.remove()); markersRef.current = [];
      const routeIds = new Set((routeStops || []).map((s) => s.pujaId));
      pujas.filter((p) => !routeIds.has(p.id)).forEach((puja) => {
        const el = createPinElement(CROWD_COLOR[puja.current_crowd_level || puja.crowdLevel] || CROWD_COLOR.UNKNOWN, { size: 22, ring: true, icon: '🛕' });
        el.addEventListener('click', () => onMarkerClick?.(puja));
        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([Number(puja.longitude), Number(puja.latitude)]).addTo(map));
      });

      pujas.forEach((puja) => {
        const facilities = puja.facilities || {};
        const matching = activeFacilityTypes.filter((type) => type === 'metro' || type === 'bus' ? !!facilities[type] : !!facilities[type]);
        if (matching.length) {
          markersRef.current.push(new mapboxgl.Marker({ element: createFacilityBadgeElement(matching), offset: [0, -25] }).setLngLat([Number(puja.longitude), Number(puja.latitude)]).addTo(map));
        }
      });

      facilityMarkers.forEach((fm) => {
        const matching = activeFacilityTypes.filter((type) => type === 'metro' || type === 'bus' ? !!fm.facilities?.[type] : !!fm.facilities?.[type]);
        if (!matching.length) return;
        markersRef.current.push(new mapboxgl.Marker({ element: createFacilityBadgeElement(matching), offset: [0, -20] }).setLngLat([Number(fm.longitude), Number(fm.latitude)]).addTo(map));
      });

      staticPoiMarkers(activeFacilityTypes).forEach((poi) => {
        const el = createPinElement(poi.color, { size: 20, icon: poi.icon });
        el.addEventListener('click', () => onStaticPoiClick?.(poi));
        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([poi.longitude, poi.latitude]).addTo(map));
      });

      (routeStops || []).forEach((stop, index) => {
        const el = createStopNumberElement(index, '#E32636'); el.addEventListener('click', () => onMarkerClick?.(stop));
        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([Number(stop.longitude), Number(stop.latitude)]).addTo(map));
      });

      if (routeStart) {
        const el = createPinElement('#059669', { size: 28, icon: 'S' });
        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([routeStart.longitude, routeStart.latitude]).addTo(map));
      }
      if (routeEnd) {
        const el = createPinElement('#7C3AED', { size: 28, icon: 'E' });
        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([routeEnd.longitude, routeEnd.latitude]).addTo(map));
      }
      if (userLocation) {
        const el = createPinElement('#2563EB', { size: 18, ring: true, icon: '•' });
        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map));
      }
    };
    if (map.isStyleLoaded()) render(); else map.once('load', render);
    return () => map.off('load', render);
  }, [pujas, facilityMarkers, activeFacilityTypes, routeStops, routeStart, routeEnd, userLocation, onMarkerClick, onStaticPoiClick]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const draw = () => {
      const coordinates = routeGeometry?.coordinates?.length ? routeGeometry.coordinates : [];
      if (!coordinates.length && routeStart) coordinates.push([routeStart.longitude, routeStart.latitude]);
      (routeStops || []).forEach((s) => coordinates.push([Number(s.longitude), Number(s.latitude)]));
      if (routeEnd) coordinates.push([routeEnd.longitude, routeEnd.latitude]);
      if (userLocation && coordinates.length === 0) coordinates.push([userLocation.longitude, userLocation.latitude]);
      const existing = map.getSource(ROUTE_SOURCE_ID);
      if (coordinates.length < 2) {
        if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
        if (existing) map.removeSource(ROUTE_SOURCE_ID);
        return;
      }
      const geojson = { type: 'Feature', geometry: { type: 'LineString', coordinates } };
      if (existing) existing.setData(geojson);
      else {
        map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: geojson });
        map.addLayer({ id: ROUTE_LAYER_ID, type: 'line', source: ROUTE_SOURCE_ID, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#E32636', 'line-width': 5, 'line-opacity': 0.78 } });
      }
      if (coordinates.length > 1) {
        const bounds = coordinates.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 700 });
      }
    };
    if (map.isStyleLoaded()) draw(); else map.once('load', draw);
  }, [routeStops, routeStart, routeEnd, routeGeometry, userLocation]);

  return <div ref={containerRef} className={className} />;
}
