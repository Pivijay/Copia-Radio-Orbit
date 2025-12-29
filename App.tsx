
import React, { useState, useCallback, useEffect } from 'react';
import GlobeViz from './components/GlobeViz';
import StationList from './components/StationList';
import Player from './components/Player';
import AIAssistant from './components/AIAssistant';
import { getStationsByCountry, searchGlobalStations } from './services/radioApi';
import { Station, FilterState, Recording } from './types';
import { Radio } from 'lucide-react';

const App: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [favorites, setFavorites] = useState<Station[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [filter, setFilter] = useState<FilterState>({
    countryCode: null,
    countryName: null,
    city: null,
    geoRegion: null,
    searchQuery: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('radio-orbit-favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const handleToggleFavorite = (station: Station) => {
    setFavorites(prev => {
      const exists = prev.find(s => s.stationuuid === station.stationuuid);
      let newFavorites;
      if (exists) {
        newFavorites = prev.filter(s => s.stationuuid !== station.stationuuid);
      } else {
        newFavorites = [...prev, station];
      }
      localStorage.setItem('radio-orbit-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleAddRecording = (recording: Recording) => {
    setRecordings(prev => [recording, ...prev]);
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings(prev => {
        const target = prev.find(r => r.id === id);
        if (target) URL.revokeObjectURL(target.blobUrl);
        return prev.filter(r => r.id !== id);
    });
  };

  const handleCountrySelect = useCallback(async (countryCode: string, countryName: string) => {
    setFilter(prev => ({ ...prev, countryCode, countryName, city: null }));
    setIsSidebarOpen(true);
    setLoading(true);

    try {
        const data = await getStationsByCountry(countryCode, countryName);
        setStations(data);
    } catch (err) {
        console.error("Selection failed:", err);
        setStations([]);
    } finally {
        setLoading(false);
    }
  }, []);

  const handleCitySelect = useCallback((cityName: string, lat: number, lng: number) => {
    setFilter(prev => ({ ...prev, city: cityName }));
    setIsSidebarOpen(true);
  }, []);

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
  };

  const handleResetCity = () => {
      setFilter(prev => ({ ...prev, city: null }));
  };

  const handleAiSearch = async (query: string) => {
    setLoading(true);
    setIsSidebarOpen(true);
    setFilter(prev => ({ ...prev, countryName: 'AI RESULTS', countryCode: 'AI' }));
    try {
      const data = await searchGlobalStations(query);
      setStations(data);
    } catch (err) {
      console.error("AI search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col font-rajdhani">
      <GlobeViz 
        onCountrySelect={handleCountrySelect} 
        onCitySelect={handleCitySelect}
        selectedCountryCode={filter.countryCode}
        selectedCity={filter.city}
        stations={stations}
      />

      <div className={`absolute top-6 left-6 z-30 pointer-events-none select-none transition-opacity duration-500 ${isSidebarOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center gap-3">
          <Radio className="text-emerald-400 w-8 h-8 md:w-12 md:h-12" />
          RADIO ORBIT
        </h1>
        <p className="text-slate-400 text-sm md:text-base tracking-[0.3em] ml-1 mt-1 font-mono">
          GLOBAL FREQUENCY TUNER
        </p>
      </div>

      <AIAssistant onAiSearch={handleAiSearch} />

      {!isSidebarOpen && !selectedStation && (
        <div className="absolute bottom-32 left-0 right-0 text-center pointer-events-none z-20 animate-pulse px-4">
           <p className="text-emerald-500/80 font-mono text-sm border border-emerald-500/20 inline-block px-4 py-2 rounded bg-slate-900/50 backdrop-blur-sm">
             [ SELECT A COUNTRY TO INITIALIZE SCAN ]
           </p>
        </div>
      )}

      {isSidebarOpen && (
        <StationList 
          filter={filter} 
          onClose={() => setIsSidebarOpen(false)} 
          onSelectStation={handleStationSelect}
          selectedStationId={selectedStation?.stationuuid}
          stations={stations}
          favorites={favorites}
          recordings={recordings}
          onToggleFavorite={handleToggleFavorite}
          onDeleteRecording={handleDeleteRecording}
          loading={loading}
          onResetCity={handleResetCity}
        />
      )}

      <Player 
        station={selectedStation} 
        isFavorite={selectedStation ? favorites.some(s => s.stationuuid === selectedStation.stationuuid) : false}
        onToggleFavorite={selectedStation ? () => handleToggleFavorite(selectedStation) : undefined}
        onAddRecording={handleAddRecording}
      />
    </div>
  );
};

export default App;
