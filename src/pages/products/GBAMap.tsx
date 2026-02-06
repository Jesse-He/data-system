import React, { useEffect, useRef, useState } from 'react';
import { Card, Radio, Space, Typography } from 'antd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import gbaGeoJsonRaw from '../../data/GBA.geojson?raw';

const { Text } = Typography;

type WeatherMode = 'temp' | 'humidity' | 'wind' | 'rain' | 'none';

const GBAMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mode, setMode] = useState<WeatherMode>('none');
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const canvasLayerRef = useRef<L.Layer | null>(null);
  const animationRef = useRef<number | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const featureValuesRef = useRef<Record<string, number>>({});
  const colorFromT = (t: number) => {
    const clamp = (x: number) => Math.max(0, Math.min(1, x));
    const tt = clamp(t);
    const start = { r: 209, g: 233, b: 255 }; // 淡蓝
    const end = { r: 255, g: 61, b: 61 };     // 红
    const r = Math.round(start.r * (1 - tt) + end.r * tt);
    const g = Math.round(start.g * (1 - tt) + end.g * tt);
    const b = Math.round(start.b * (1 - tt) + end.b * tt);
    return `rgb(${r},${g},${b})`;
  };

  const humidityColor = (v: number) => {
    if (v <= 50) return '#edf8fb';
    if (v <= 60) return '#ccece6';
    if (v <= 70) return '#99d8c9';
    if (v <= 80) return '#66c2a4';
    if (v <= 90) return '#41ae76';
    return '#238b45';
  };
  const rainColor = (v: number) => {
    if (v <= 5) return '#f7fbff';
    if (v <= 10) return '#deebf7';
    if (v <= 20) return '#c6dbef';
    if (v <= 30) return '#9ecae1';
    if (v <= 40) return '#6baed6';
    return '#2171b5';
  };
  const windColor = (v: number) => {
    if (v <= 2) return '#ffffcc';
    if (v <= 4) return '#ffeda0';
    if (v <= 6) return '#fed976';
    if (v <= 8) return '#feb24c';
    if (v <= 10) return '#fd8d3c';
    return '#f03b20';
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already initialized
    if (!mapRef.current) {
      // China bounds: South West [3.86, 73.66], North East [53.55, 135.05]
      const chinaBounds = L.latLngBounds(
        [3.86, 73.66],
        [53.55, 135.05]
      );

      const map = L.map(mapContainerRef.current, {
        maxBounds: chinaBounds,
        maxBoundsViscosity: 1.0, // Make bounds rigid
        minZoom: 4               // Prevent zooming out too far
      }).setView([22.5, 113.5], 9); // Default center, will be overridden by fitBounds

      // Add a light-themed tile layer (CartoDB Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapRef.current;
    const gbaGeoJson = JSON.parse(gbaGeoJsonRaw);

    // Add GeoJSON layer
    const geoJsonLayer = L.geoJSON(gbaGeoJson, {
      style: {
        color: '#4682B4',
        weight: 1,
        opacity: 1,
        fillColor: '#D9EBF7',
        fillOpacity: 0.4,
        dashArray: '2 2'
      },
      onEachFeature: (feature, layer) => {
        const name = (feature.properties && feature.properties.name) || '';
        const contentForMode = () => name;

        layer.on('mousemove', (e: L.LeafletMouseEvent) => {
          layer.bindTooltip(contentForMode(), {
            permanent: false,
            direction: 'auto',
            offset: L.point(0, -10),
            className: 'gba-label'
          }).openTooltip(e.latlng);
        });

        layer.on('click', (e: L.LeafletMouseEvent) => {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
          layer.closeTooltip();
        });

        layer.on('mouseout', () => {
          layer.closeTooltip();
        });
      }
    }).addTo(map);
    geoJsonLayerRef.current = geoJsonLayer;

    // Fit map to GeoJSON bounds
    if (Array.isArray(gbaGeoJson.features) && gbaGeoJson.features.length > 0) {
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle Mode Switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layerGroupRef.current) return;

    // Clear existing markers
    layerGroupRef.current.clearLayers();
    // Stop any animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    // Remove canvas layer if exists
    if (canvasLayerRef.current) {
      map.removeLayer(canvasLayerRef.current);
      canvasLayerRef.current = null;
    }

    if (mode === 'none') return;

    // Compute per-feature values and update styles/tooltips
    if (geoJsonLayerRef.current) {
      const layers = geoJsonLayerRef.current.getLayers().filter((l): l is L.Path & { feature: GeoJSON.Feature } => {
        return 'feature' in l;
      });
      // Generate values per feature for current mode
      layers.forEach((l) => {
        const f = l.feature;
        const name = (typeof f.properties?.name === 'string' && f.properties.name) || '';
        let v = 0;
        if (mode === 'temp') v = 18 + Math.random() * 20;
        if (mode === 'humidity') v = 40 + Math.random() * 60;
        if (mode === 'rain') v = Math.random() * 50;
        if (mode === 'wind') v = Math.random() * 10;
        featureValuesRef.current[name] = v;
      });

      layers.forEach((l) => {
        const f = l.feature;
        const name = (typeof f.properties?.name === 'string' && f.properties.name) || '';
        const v = featureValuesRef.current[name];
        if (mode === 'temp') {
          l.setStyle({ fillColor: '#D9EBF7', fillOpacity: 0.4, color: '#4682B4', weight: 1, opacity: 1, dashArray: '2 2' });
        } else if (mode === 'humidity') {
          l.setStyle({ fillColor: humidityColor(v), fillOpacity: 0.6, color: '#4682B4', weight: 1, opacity: 1, dashArray: '2 2' });
        } else if (mode === 'rain') {
          l.setStyle({ fillColor: rainColor(v), fillOpacity: 0.6, color: '#4682B4', weight: 1, opacity: 1, dashArray: '2 2' });
        } else if (mode === 'wind') {
          l.setStyle({ fillColor: windColor(v), fillOpacity: 0.5, color: '#4682B4', weight: 1, opacity: 1, dashArray: '2 2' });
        } else {
          l.setStyle({ fillColor: '#D9EBF7', fillOpacity: 0.4, color: '#4682B4', weight: 1, opacity: 1, dashArray: '2 2' });
        }
      });
    }

    // Temperature mode now uses per-region uniform fill derived from GeoJSON
    if (mode === 'temp' && geoJsonLayerRef.current) {
      const bounds = geoJsonLayerRef.current.getBounds();
      const latMin = bounds.getSouth();
      const latMax = bounds.getNorth();
      const hasGetBounds = (l: unknown): l is (L.Polygon | L.Polyline) & { feature: GeoJSON.Feature } =>
        typeof (l as { getBounds?: unknown }).getBounds === 'function' && 'feature' in (l as object);
      const layers = geoJsonLayerRef.current.getLayers().filter(hasGetBounds);
      layers.forEach((l) => {
        const center = l.getBounds().getCenter();
        const tNorm = (center.lat - latMin) / Math.max(0.0001, (latMax - latMin));
        const color = colorFromT(1 - tNorm);
        l.setStyle({ fillColor: color, fillOpacity: 0.6, color: '#4682B4', weight: 1, opacity: 1, dashArray: '2 2' });
      });
    }

    // Special handling for Wind Mode: Particles
    if (mode === 'wind') {
      // Custom Canvas Layer for Particles
      type WindCanvasLayer = L.Layer & {
        _canvas: HTMLCanvasElement;
        _ctx: CanvasRenderingContext2D | null;
        _width: number;
        _height: number;
        _particles: Array<{ x: number; y: number; vx: number; vy: number; age: number }>;
        _t: number;
        _regions: Array<{ lat: number; lng: number; dir: number; speed: number; strength: number; ll: L.LatLng }>;
        _animate: () => void;
        _updatePosition: () => void;
        _resize: () => void;
      };
      const CanvasLayer: { new (): WindCanvasLayer } = (L.Layer.extend({
        onAdd: function(map: L.Map) {
          const canvas = L.DomUtil.create('canvas', 'leaflet-wind-canvas');
          const size = map.getSize();
          canvas.width = size.x;
          canvas.height = size.y;
          canvas.style.position = 'absolute';
          canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
          canvas.style.zIndex = '100'; // Above map tiles but below markers
          
          this._canvas = canvas;
          map.getPanes().overlayPane.appendChild(canvas);
          
          this._ctx = canvas.getContext('2d');
          this._width = size.x;
          this._height = size.y;
          this._t = 0;
          // Build region-based flow seeds from GeoJSON
          const hasGetBounds = (l: unknown): l is (L.Polygon | L.Polyline) & { feature: GeoJSON.Feature } =>
            typeof (l as { getBounds?: unknown }).getBounds === 'function' && 'feature' in (l as object);
          const layers = geoJsonLayerRef.current?.getLayers().filter(hasGetBounds) ?? [];
          const bounds = geoJsonLayerRef.current?.getBounds();
          const latMin = bounds?.getSouth() ?? 21.0;
          const latMax = bounds?.getNorth() ?? 25.0;
          this._regions = layers.map((l) => {
            const props = (l.feature.properties || {}) as Record<string, unknown>;
            let center: L.LatLng = l.getBounds().getCenter();
            const centroidStr = typeof props.centroid === 'string' ? String(props.centroid) : '';
            const m = centroidStr.match(/\[([\d.]+),\s*([\d.]+)\]/);
            if (m) {
              const lng = parseFloat(m[1]);
              const lat = parseFloat(m[2]);
              center = L.latLng(lat, lng);
            }
            const latNorm = (center.lat - latMin) / Math.max(0.0001, (latMax - latMin));
            const dir = (Math.PI / 6) + latNorm * (Math.PI / 3); // 30° ~ 90°
            const speed = 0.8 + 1.2 * latNorm; // 0.8 ~ 2.0
            const strength = 1.0;
            return { lat: center.lat, lng: center.lng, dir, speed, strength, ll: center };
          });

          // Particle system
          this._particles = [];
          for (let i = 0; i < 300; i++) {
            this._particles.push({
              x: Math.random() * this._width,
              y: Math.random() * this._height,
              px: Math.random() * this._width,
              py: Math.random() * this._height,
              // Flow towards North-East generally
              vx: 1 + Math.random(), 
              vy: -0.5 + Math.random() * 0.5,
              age: Math.random() * 100
            });
          }

          this._animate();
          
          map.on('move', this._updatePosition, this);
          map.on('resize', this._resize, this);
        },

        onRemove: function(map: L.Map) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            L.DomUtil.remove(this._canvas);
            map.off('move', this._updatePosition, this);
            map.off('resize', this._resize, this);
        },

        _updatePosition: function() {
           const map = this._map;
           const topLeft = map.containerPointToLayerPoint([0, 0]);
           L.DomUtil.setPosition(this._canvas, topLeft);
        },
        
        _resize: function() {
            const map = this._map;
            const size = map.getSize();
            this._canvas.width = size.x;
            this._canvas.height = size.y;
            this._width = size.x;
            this._height = size.y;
        },

        _animate: function() {
          const ctx = this._ctx;
          if (!ctx) return;
          
          // Fade previous trails without whitening the base map
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'rgba(0,0,0,0.06)';
          ctx.fillRect(0, 0, this._width, this._height);
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = 'rgba(70, 130, 180, 0.4)';
          ctx.lineWidth = 1.0;
          this._t += 1;

          const field = (x: number, y: number) => {
            const latlng = this._map.containerPointToLatLng(L.point(x, y));
            // Weighted sum of nearest region vectors
            let vx = 0;
            let vy = 0;
            let wsum = 0;
            // pick top-5 nearest
            const nearest = this._regions
              .map((r: { lat: number; lng: number; dir: number; speed: number; strength: number; ll: L.LatLng }) => {
                const dLat = latlng.lat - r.lat;
                const dLng = latlng.lng - r.lng;
                const dist = Math.sqrt(dLat * dLat + dLng * dLng);
                return { r, dist };
              })
              .sort((a: { r: { lat: number; lng: number; dir: number; speed: number; strength: number; ll: L.LatLng }; dist: number }, b: { r: { lat: number; lng: number; dir: number; speed: number; strength: number; ll: L.LatLng }; dist: number }) => a.dist - b.dist)
              .slice(0, 5);
            nearest.forEach(({ r, dist }: { r: { lat: number; lng: number; dir: number; speed: number; strength: number; ll: L.LatLng }; dist: number }) => {
              const w = Math.exp(-dist * 10) * r.strength; // sharp decay
              const dirX = Math.cos(r.dir);
              const dirY = Math.sin(r.dir);
              vx += w * r.speed * dirX;
              vy += w * r.speed * dirY;
              // add mild swirl around region center
              const dLat = latlng.lat - r.lat;
              const dLng = latlng.lng - r.lng;
              const swirl = Math.exp(-dist * 20) * 0.6;
              vx += swirl * (-dLat);
              vy += swirl * (dLng);
              wsum += w + swirl;
            });
            if (wsum < 0.0001) {
              // fallback gentle NE flow
              vx += 0.8;
              vy += -0.3;
              wsum = 1;
            }
            return { vx: vx / wsum, vy: vy / wsum };
          };
          
          this._particles.forEach((p: { x: number; y: number; vx: number; vy: number; age: number }) => {
             const oldX = p.x;
             const oldY = p.y;
             const v = field(p.x, p.y);
             // clamp velocity to avoid long jumps
             const mag = Math.hypot(v.vx, v.vy);
             const maxMag = 2.2;
             const scale = mag > maxMag ? (maxMag / Math.max(mag, 0.0001)) : 1;
             p.vx = v.vx * scale;
             p.vy = v.vy * scale;
             p.x += p.vx;
             p.y += p.vy;
             p.age++;

             if (p.age > 160 || p.x < 0 || p.x > this._width || p.y < 0 || p.y > this._height) {
                 p.x = Math.random() * this._width;
                 p.y = Math.random() * this._height;
                 p.age = 0;
                 return; // skip drawing on reset
             }
             
             const dx = p.x - oldX;
             const dy = p.y - oldY;
             const seg = Math.hypot(dx, dy);
             if (seg < 10) {
               ctx.beginPath();
               ctx.moveTo(oldX, oldY);
               ctx.lineTo(p.x, p.y);
               ctx.stroke();
             }
          });

          animationRef.current = requestAnimationFrame(() => this._animate());
        }
      }) as unknown) as { new (): WindCanvasLayer };

      const canvasLayer = new CanvasLayer();
      canvasLayer.addTo(map);
      canvasLayerRef.current = canvasLayer;
    }

  }, [mode]);

  return (
    <Card 
        style={{ height: 'calc(100vh - 120px)', margin: 0, position: 'relative' }} 
        bodyStyle={{ height: '100%', padding: 0 }}
    >
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <Space direction="vertical">
          <Text strong>气象图层</Text>
          <Radio.Group 
            value={mode} 
            onChange={e => setMode(e.target.value)}
            buttonStyle="solid"
          >
            <Space direction="vertical">
              <Radio value="temp">温度</Radio>
              <Radio value="humidity">湿度</Radio>
              <Radio value="wind">风速</Radio>
              <Radio value="rain">降雨</Radio>
              <Radio value="none">关闭</Radio>
            </Space>
          </Radio.Group>
        </Space>
      </div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 0 }} />
    </Card>
  );
};

export default GBAMap;
