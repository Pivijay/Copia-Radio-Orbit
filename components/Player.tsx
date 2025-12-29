import React, { useEffect, useRef, useState } from 'react';
import { Station, Recording } from '../types';
import { Play, Pause, Volume2, VolumeX, Radio, AlertCircle, Heart, Mic, Square } from 'lucide-react';
import Hls from 'hls.js';

interface PlayerProps {
  station: Station | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddRecording?: (recording: Recording) => void;
}

const Player: React.FC<PlayerProps> = ({ station, isFavorite = false, onToggleFavorite, onAddRecording }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const safePlay = async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setError(false);
    } catch (e: any) {
      if (e.name === 'AbortError' || e.message?.includes('interrupted')) return;
      console.warn("Playback prevented:", e);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!station || !audioRef.current) return;

    if (isRecording) stopRecording();

    let active = true;
    const audio = audioRef.current;
    const url = station.url_resolved || station.url;
    
    setLoading(true);
    setError(false);
    setIsPlaying(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    audio.pause();
    audio.src = '';
    audio.load();

    const isHls = url.includes('.m3u8') || station.codec === 'HLS';

    if (isHls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.attachMedia(audio);

        hls.on(Hls.Events.MEDIA_ATTACHED, () => { if (active) hls.loadSource(url); });
        hls.on(Hls.Events.MANIFEST_PARSED, () => { if (active) { setLoading(false); safePlay(audio); } });
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (!active) return;
            if (data.fatal) {
                hls.destroy();
                if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                    audio.src = url;
                    safePlay(audio);
                } else if (active) {
                    setError(true);
                    setLoading(false);
                }
            }
        });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl') && isHls) {
        const onCanPlay = () => { if (active) { setLoading(false); safePlay(audio); } audio.removeEventListener('canplay', onCanPlay); };
        audio.addEventListener('canplay', onCanPlay);
        audio.src = url;
        audio.load();
    } else {
        if (isHls) { setError(true); setLoading(false); return; }
        audio.src = url;
        audio.load();
        safePlay(audio);
    }

    return () => {
       active = false;
       if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
       if (audio) { audio.pause(); audio.src = ''; audio.load(); }
    };
  }, [station]);

  const startRecording = () => {
    if (!audioRef.current || !station) return;
    const audio = audioRef.current;
    
    const stream = (audio as any).captureStream ? (audio as any).captureStream() : (audio as any).mozCaptureStream ? (audio as any).mozCaptureStream() : null;

    if (!stream) {
        alert("Your browser does not support audio recording from this source.");
        return;
    }

    try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });
        chunksRef.current = [];
        
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            if (chunksRef.current.length === 0) return;
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const durationStr = formatTime(recordingTime);
            
            const newRecording: Recording = {
                id: Date.now().toString(),
                stationName: station.name,
                timestamp: Date.now(),
                duration: durationStr,
                blobUrl: url,
                size: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
            };
            
            if (onAddRecording) onAddRecording(newRecording);
            chunksRef.current = [];
            setRecordingTime(0);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingTime(0);

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

    } catch (err) {
        console.error("Recording failed:", err);
        alert("Recording failed. The stream might be protected (CORS).");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const togglePlay = () => {
    if (!audioRef.current || !station) return;
    if (isPlaying) audioRef.current.pause();
    else safePlay(audioRef.current);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    if (val > 0 && isMuted) setIsMuted(false);
  };

  if (!station) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-slate-900/95 backdrop-blur-md border-t border-emerald-500/50 z-50 flex items-center px-4 md:px-8 shadow-[0_-5px_20px_rgba(16,185,129,0.2)] text-gray-200">
      <audio 
        ref={audioRef}
        playsInline 
        crossOrigin="anonymous"
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={(e) => {
            if (hlsRef.current) return;
            const err = e.currentTarget.error;
            if (err && !loading) {
                setError(true);
                setLoading(false);
            }
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => { setLoading(false); setError(false); }}
      />

      {/* Station Info */}
      <div className="flex items-center space-x-3 md:space-x-4 w-[45%] md:w-1/3 min-w-0">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-md border border-slate-600 flex items-center justify-center overflow-hidden shrink-0 relative">
          {station.favicon ? (
             <img src={station.favicon} alt="logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
          ) : (
            <Radio className="text-emerald-500 w-6 h-6 md:w-8 md:h-8" />
          )}
           {isPlaying && <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />}
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-1.5 md:gap-2">
            <h3 className="font-bold text-sm md:text-lg text-emerald-400 truncate font-rajdhani leading-tight">{station.name}</h3>
            {onToggleFavorite && (
                <button onClick={onToggleFavorite} className={`shrink-0 transition-transform ${isFavorite ? 'text-pink-500' : 'text-slate-500'}`}>
                    <Heart size={14} className={isFavorite ? "fill-pink-500" : ""} />
                </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate font-mono mt-0.5">
             {station.country}
          </p>
          {error && <div className="text-red-500 text-[9px] font-bold animate-pulse mt-0.5">SIGNAL LOST</div>}
          {loading && !error && <p className="text-[9px] text-yellow-400 animate-pulse font-mono mt-0.5">TUNING...</p>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex justify-center items-center">
        <button 
            onClick={togglePlay}
            disabled={error}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
                error 
                ? 'bg-slate-800 text-slate-600 border border-slate-700' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400'
            }`}
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      {/* Volume & Record */}
      <div className="w-[15%] md:w-1/3 flex justify-end items-center space-x-2 md:space-x-4">
        
        {/* Record Button - Always visible */}
        <div className="relative flex flex-col items-center">
            <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500' : 'text-slate-400 hover:text-red-500 hover:bg-slate-800'}`}
                title={isRecording ? "Stop Recording" : "Start Recording"}
            >
                {isRecording ? <Square size={12} fill="currentColor" /> : <Mic size={18} className="md:w-4 md:h-4" />}
            </button>
            {isRecording && (
                <div className="absolute bottom-full mb-2 right-0 text-[9px] md:text-[10px] font-mono text-red-400 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-red-900 shadow-lg z-50">
                    {formatTime(recordingTime)}
                </div>
            )}
        </div>

        {/* Volume controls - Only on Desktop */}
        <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleMute} className="text-slate-400 hover:text-emerald-400 transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
        </div>
      </div>
    </div>
  );
};

export default Player;