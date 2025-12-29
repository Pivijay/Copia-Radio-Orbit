import React, { useEffect, useState, useMemo } from 'react';
import { Station, FilterState, Recording } from '../types';
import { searchGlobalStations } from '../services/radioApi';
import { Search, MapPin, Radio, X, Music, Globe2, Signal, Globe, Heart, Mic, Trash2, Download } from 'lucide-react';

interface StationListProps {
  filter: FilterState;
  onClose: () => void;
  onSelectStation: (station: Station) => void;
  selectedStationId?: string;
  stations: Station[]; // Current map selection
  favorites: Station[]; // Persisted favorites
  recordings?: Recording[]; // New: Recordings list
  onToggleFavorite: (station: Station) => void;
  onDeleteRecording?: (id: string) => void;
  loading: boolean;
  onResetCity: () => void;
}

const StationList: React.FC<StationListProps> = ({ 
  filter, 
  onClose, 
  onSelectStation, 
  selectedStationId,
  stations,
  favorites,
  recordings = [],
  onToggleFavorite,
  onDeleteRecording,
  loading,
  onResetCity
}) => {
  const [viewMode, setViewMode] = useState<'feed' | 'favorites' | 'recordings'>('feed');
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(50);
  const [globalResults, setGlobalResults] = useState<Station[] | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  // Switch to feed view automatically when filter changes
  useEffect(() => {
    if (filter.countryCode) {
        setViewMode('feed');
    }
  }, [filter.countryCode]);

  useEffect(() => {
    setLimit(50);
    setGlobalResults(null);
    setSearchTerm('');
  }, [stations, favorites, recordings, viewMode]);

  const handleGlobalSearch = async () => {
    if (!searchTerm) return;
    setIsSearchingGlobal(true);
    const results = await searchGlobalStations(searchTerm);
    setGlobalResults(results);
    setIsSearchingGlobal(false);
  };

  const filteredStations = useMemo(() => {
    if (viewMode === 'recordings') return []; 
    if (globalResults !== null) return globalResults;

    let result = viewMode === 'feed' ? stations : favorites;

    if (viewMode === 'feed' && filter.city) {
      result = result.filter(s => {
          const filterCity = filter.city!.toLowerCase().trim();
          const sCity = (s.city || '').toLowerCase().trim();
          const sState = (s.state || '').toLowerCase().trim();
          return sCity === filterCity || sCity.includes(filterCity) || filterCity.includes(sCity) || 
                 sState === filterCity || sState.includes(filterCity);
      });
    }

    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        result = result.filter(s => 
            s.name.toLowerCase().includes(lower) || 
            s.tags.toLowerCase().includes(lower) ||
            (s.city || '').toLowerCase().includes(lower)
        );
    }
    return result;
  }, [stations, favorites, filter.city, searchTerm, globalResults, viewMode]);

  const displayStations = filteredStations.slice(0, limit);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (viewMode === 'recordings') return;
      const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 100;
      if (bottom && limit < filteredStations.length) {
          setLimit(prev => prev + 50);
      }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[28rem] bg-slate-900/95 backdrop-blur-xl border-l border-emerald-500/30 z-40 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-300">
      
      {/* Header */}
      <div className="pt-5 px-5 pb-0 border-b border-emerald-500/20 bg-slate-950/50">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
             {/* Tabs */}
             <div className="flex items-center space-x-4 mb-3">
                <button 
                    onClick={() => setViewMode('feed')}
                    className={`text-xs md:text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${viewMode === 'feed' ? 'text-emerald-400 border-emerald-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    Live Feed
                </button>
                <button 
                    onClick={() => setViewMode('favorites')}
                    className={`text-xs md:text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors flex items-center gap-1 ${viewMode === 'favorites' ? 'text-pink-400 border-pink-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    <Heart size={12} className={viewMode === 'favorites' ? 'fill-pink-400' : ''} /> Favorites
                </button>
                <button 
                    onClick={() => setViewMode('recordings')}
                    className={`text-xs md:text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors flex items-center gap-1 ${viewMode === 'recordings' ? 'text-red-400 border-red-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                    <Mic size={12} className={viewMode === 'recordings' ? 'fill-red-400' : ''} /> Recordings
                </button>
             </div>

              {/* Title Context */}
              {viewMode === 'feed' && (
                  <>
                    <div className="flex items-center space-x-2 text-emerald-500/80">
                        <Globe2 size={16} />
                        <h2 className="text-lg font-bold uppercase tracking-wider leading-none truncate max-w-[200px]">
                            {globalResults ? 'GLOBAL SEARCH' : (filter.countryName || 'SELECT COUNTRY')}
                        </h2>
                    </div>
                    {filter.city && (
                        <div className="flex items-center mt-2 space-x-2 animate-fadeIn">
                            <span className="text-xs text-slate-400 uppercase tracking-widest">CITY:</span>
                            <button onClick={onResetCity} className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm font-bold flex items-center shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-emerald-500/30 transition-colors cursor-pointer group">
                                <MapPin size={12} className="mr-1.5 fill-emerald-500/20"/> 
                                {filter.city}
                                <X size={12} className="ml-2 opacity-50 group-hover:opacity-100" />
                            </button>
                        </div>
                    )}
                  </>
              )}
              {viewMode === 'recordings' && (
                  <div className="flex items-center space-x-2 text-red-500/80">
                        <Mic size={16} />
                        <h2 className="text-lg font-bold uppercase tracking-wider leading-none">MY RECORDINGS</h2>
                  </div>
              )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar (Hide for Recordings) */}
        {viewMode !== 'recordings' && (
            <div className="space-y-2 pb-4">
                <div className="relative group">
                <Search className="absolute left-3 top-2.5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder={viewMode === 'favorites' ? "Search favorites..." : "Find station..."}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value === '' && globalResults) setGlobalResults(null); 
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGlobalSearch();
                    }}
                    className="w-full bg-slate-900 text-gray-200 pl-10 pr-4 py-2.5 rounded border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
                />
                </div>
                
                {viewMode === 'feed' && searchTerm && !globalResults && (
                    <button 
                        onClick={handleGlobalSearch}
                        disabled={isSearchingGlobal}
                        className="w-full py-2 bg-emerald-900/30 border border-emerald-500/30 rounded text-emerald-400 text-xs font-bold uppercase hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                        {isSearchingGlobal ? <Signal className="animate-pulse w-3 h-3"/> : <Globe className="w-3 h-3"/>}
                        {isSearchingGlobal ? 'SEARCHING WORLDWIDE...' : `SEARCH GLOBAL DB FOR "${searchTerm}"`}
                    </button>
                )}
                {globalResults && (
                    <button 
                        onClick={() => { setGlobalResults(null); setSearchTerm(''); }}
                        className="w-full py-2 bg-slate-800 border border-slate-700 rounded text-slate-400 text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
                    >
                        CLEAR SEARCH RESULTS
                    </button>
                )}
            </div>
        )}
      </div>

      {/* List Content */}
      <div 
        className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
        onScroll={handleScroll}
      >
        {viewMode === 'recordings' ? (
            // --- RECORDINGS LIST VIEW ---
            recordings.length === 0 ? (
                <div className="text-center p-12 text-slate-600">
                    <Mic size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-mono text-sm">NO RECORDINGS YET</p>
                    <p className="text-xs mt-2 opacity-60 max-w-[200px] mx-auto">Use the red button in the player to record live radio streams.</p>
                </div>
            ) : (
                <div className="space-y-2 p-2">
                    {recordings.map(rec => (
                        <div key={rec.id} className="bg-slate-800/50 p-3 rounded border border-slate-700 hover:border-red-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{rec.stationName}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                                        <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{new Date(rec.timestamp).toLocaleTimeString()}</span>
                                        <span>•</span>
                                        <span className="text-emerald-400">{rec.duration}</span>
                                        <span>•</span>
                                        <span>{rec.size}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <a 
                                        href={rec.blobUrl} 
                                        download={`${rec.stationName}-recording.webm`} 
                                        className="p-1.5 bg-slate-700 rounded hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                                        title="Download"
                                    >
                                        <Download size={14} />
                                    </a>
                                    <button 
                                        onClick={() => onDeleteRecording && onDeleteRecording(rec.id)} 
                                        className="p-1.5 bg-slate-700 rounded hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <audio 
                                controls 
                                src={rec.blobUrl} 
                                className="w-full h-8 mt-2 rounded bg-slate-900" 
                            />
                        </div>
                    ))}
                </div>
            )
        ) : (
            // --- STATION LIST VIEW (Feed / Favorites) ---
            loading || isSearchingGlobal ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Signal size={16} className="text-emerald-500/50 animate-pulse"/>
                        </div>
                    </div>
                    <p className="text-emerald-500/80 animate-pulse text-xs font-mono tracking-widest">DECODING FREQUENCIES...</p>
                </div>
            ) : filteredStations.length === 0 ? (
                <div className="text-center p-12 text-slate-600">
                    <Radio size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-mono text-sm">NO SIGNAL FOUND</p>
                </div>
            ) : (
                displayStations.map((station) => {
                    const isFav = favorites.some(f => f.stationuuid === station.stationuuid);
                    return (
                        <div 
                        key={station.stationuuid}
                        className={`group relative flex items-center p-3 rounded border border-transparent transition-all ${
                            selectedStationId === station.stationuuid 
                            ? 'bg-emerald-900/30 border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' 
                            : 'hover:bg-slate-800/50 hover:border-slate-700'
                        }`}
                        >
                        <div onClick={() => onSelectStation(station)} className={`w-12 h-12 rounded flex items-center justify-center shrink-0 overflow-hidden relative border cursor-pointer ${selectedStationId === station.stationuuid ? 'border-emerald-500/50 bg-black' : 'border-slate-700 bg-slate-900'}`}>
                            {station.favicon ? (
                                <img src={station.favicon} loading="lazy" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            ) : null}
                            <div className={`absolute inset-0 flex items-center justify-center ${station.favicon ? 'bg-slate-900' : ''} ${station.favicon ? 'hidden' : 'flex'}`}>
                                <Radio size={20} className={selectedStationId === station.stationuuid ? "text-emerald-400" : "text-slate-700 group-hover:text-slate-500"} />
                            </div>
                        </div>

                        <div onClick={() => onSelectStation(station)} className="ml-3 flex-1 min-w-0 cursor-pointer">
                            <h4 className={`font-bold text-sm truncate font-rajdhani ${selectedStationId === station.stationuuid ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'}`}>
                                {station.name}
                            </h4>
                            <div className="flex items-center text-[11px] text-slate-500 space-x-3 mt-1 font-mono">
                            {(globalResults || viewMode === 'favorites') && station.country && (
                                <span className="text-emerald-600 font-bold">{station.country}</span>
                            )}
                            {(station.city || station.state) && (
                                <span className="flex items-center truncate max-w-[140px] text-slate-400">
                                    <MapPin size={10} className={`mr-1 ${selectedStationId === station.stationuuid ? 'text-emerald-400' : 'text-emerald-700'}`} /> 
                                    {station.city || station.state}
                                </span>
                            )}
                            </div>
                        </div>
                        
                        <div className="shrink-0 ml-2 flex items-center space-x-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite(station); }}
                                className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${isFav ? 'text-pink-500' : 'text-slate-600 hover:text-pink-400'}`}
                            >
                                <Heart size={16} className={isFav ? "fill-pink-500" : ""} />
                            </button>
                        </div>
                        </div>
                    );
                })
            )
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 text-center border-t border-slate-800 text-[10px] text-slate-600 font-mono">
         RADIO ORBIT DATABASE • {viewMode === 'recordings' ? recordings.length + ' CLIPS' : (viewMode === 'feed' ? stations.length : favorites.length) + ' ACTIVE'}
      </div>
    </div>
  );
};

export default StationList;