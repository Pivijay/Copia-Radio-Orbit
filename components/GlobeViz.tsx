import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { Station } from '../types';

interface GlobeVizProps {
  onCountrySelect: (countryCode: string, countryName: string, polygon: any) => void;
  onCitySelect: (cityName: string, lat: number, lng: number) => void;
  selectedCountryCode: string | null;
  selectedCity: string | null;
  stations: Station[];
}

interface CityCluster {
  name: string;
  lat: number;
  lng: number;
  stationCount: number;
}

const GlobeViz: React.FC<GlobeVizProps> = ({ onCountrySelect, onCitySelect, selectedCountryCode, selectedCity, stations }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState<any | null>(null);

  useEffect(() => {
    const DATA_URL = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson';
    const FALLBACK_URL = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

    fetch(DATA_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch map data');
        return res.json();
      })
      .then(setCountries)
      .catch(err => {
        console.error("Map data load error, trying fallback:", err);
        fetch(FALLBACK_URL)
            .then(r => r.json())
            .then(setCountries)
            .catch(e => console.error("Critical: Fallback map data failed", e));
      });
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.pointOfView({ altitude: 2.5 });
    }
  }, []);

  const cityData = useMemo(() => {
    if (!stations || stations.length === 0) return [];

    const groups: Record<string, Station[]> = {};
    
    stations.forEach(s => {
        const rawCity = s.city || s.state;
        if (!rawCity || rawCity.length < 2) return;
        
        const norm = rawCity.trim().toLowerCase();
        if (!groups[norm]) groups[norm] = [];
        groups[norm].push(s);
    });

    const results: CityCluster[] = [];
    
    for (const [key, group] of Object.entries(groups)) {
        let latSum = 0;
        let lngSum = 0;
        let count = 0;

        group.forEach(s => {
            if (s.geo_lat && s.geo_long && !isNaN(Number(s.geo_lat)) && !isNaN(Number(s.geo_long))) {
                latSum += Number(s.geo_lat);
                lngSum += Number(s.geo_long);
                count++;
            }
        });

        if (count > 0) {
            results.push({
                name: group[0].city || group[0].state || 'Unknown',
                lat: latSum / count,
                lng: lngSum / count,
                stationCount: group.length
            });
        }
    }
    return results;
  }, [stations]);

  // Rings data for a "radio wave" effect on the selected city
  const ringsData = useMemo(() => {
    const selected = cityData.find(c => c.name === selectedCity);
    return selected ? [selected] : [];
  }, [cityData, selectedCity]);

  const getCountryCode = (d: any) => {
    if (!d || !d.properties) return null;
    const p = d.properties;
    return p.ISO_A2 || p.iso_a2 || p.WB_A2 || p.wb_a2 || p.ADM0_A3?.substring(0, 2) || p.adm0_a3?.substring(0, 2);
  };

  const getCountryName = (d: any) => {
      if (!d || !d.properties) return 'Unknown';
      const p = d.properties;
      return p.NAME || p.name || p.ADMIN || p.admin;
  };

  const handlePolygonClick = (polygon: any) => {
    if (globeEl.current) {
      const { lat, lng } = getCenter(polygon.geometry);
      globeEl.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
      globeEl.current.controls().autoRotate = false;
    }

    const countryCode = getCountryCode(polygon);
    const countryName = getCountryName(polygon);
    
    if (countryCode) {
        onCountrySelect(countryCode, countryName, polygon);
    }
  };

  const handleCityClick = (city: any) => {
    const c = city as CityCluster;
    if (globeEl.current) {
        globeEl.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 0.6 }, 1500);
    }
    onCitySelect(c.name, c.lat, c.lng);
  };

  const getCenter = (geometry: any) => {
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) return { lat: 0, lng: 0 };
    let coords = geometry.coordinates[0];
    if (geometry.type === "MultiPolygon") coords = geometry.coordinates[0][0];

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coords.forEach((c: any) => {
        const lng = c[0];
        const lat = c[1];
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
    });

    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  };

  return (
    <div className="absolute inset-0 z-0 bg-slate-950">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Country Polygons
        polygonsData={countries.features}
        polygonAltitude={d => {
            const code = getCountryCode(d);
            return d === hoverD || (selectedCountryCode && code === selectedCountryCode) ? 0.08 : 0.01;
        }}
        polygonCapColor={d => {
            const code = getCountryCode(d);
            if (code === selectedCountryCode) return 'rgba(16, 185, 129, 0.2)';
            return d === hoverD ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.05)';
        }}
        polygonSideColor={() => 'rgba(16, 185, 129, 0.1)'}
        polygonStrokeColor={(d) => {
             const code = getCountryCode(d);
             if (code === selectedCountryCode) return '#10b981';
             return '#34d399';
        }}
        polygonLabel={({ properties }: any) => `
          <div style="background: #0f172a; color: #34d399; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.5); font-weight: bold; font-family: sans-serif;">
            ${properties.NAME || properties.name || properties.ADMIN || properties.admin}
          </div>
        `}
        onPolygonHover={setHoverD}
        onPolygonClick={handlePolygonClick}

        // City 3D Points (Solid Markers) - Replaces problematic character labels
        pointsData={cityData}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d: any) => d.name === selectedCity ? '#10b981' : '#facc15'}
        pointAltitude={0.02}
        pointRadius={(d: any) => d.name === selectedCity ? 0.4 : 0.2}
        pointsMerge={false}
        onPointClick={handleCityClick}

        // Radio Wave Rings Effect
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => '#10b981'}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={800}

        // Labels (Only for text and tooltips)
        labelsData={cityData}
        labelLat="lat"
        labelLng="lng"
        labelText={() => ''} // Clear text to avoid character encoding issues
        labelSize={0}
        labelDotRadius={0}
        labelAltitude={0.05}
        labelLabel={(d: any) => `
            <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid ${d.name === selectedCity ? '#10b981' : '#facc15'}; padding: 8px 12px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; pointer-events: none; box-shadow: 0 4px 15px rgba(0,0,0,0.5); min-width: 120px;">
               <div style="color: #ffffff; font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.1em; font-family: 'Rajdhani', sans-serif;">${d.name}</div>
               <div style="height: 1px; width: 100%; background: ${d.name === selectedCity ? 'rgba(16, 185, 129, 0.3)' : 'rgba(250, 204, 21, 0.3)'}; margin: 4px 0;"></div>
               <div style="color: ${d.name === selectedCity ? '#10b981' : '#facc15'}; font-size: 11px; font-weight: 600; font-family: 'Rajdhani', sans-serif;">${d.stationCount} STATIONS</div>
            </div>
        `}
        onLabelClick={handleCityClick}

        atmosphereColor="#10b981"
        atmosphereAltitude={0.15}
      />
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
    </div>
  );
};

export default GlobeViz;