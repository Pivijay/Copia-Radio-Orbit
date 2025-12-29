import { Station } from '../types';

// --- CONFIGURACIÓN DE RED RESILIENTE ---

const API_MIRRORS = [
    'https://de1.api.radio-browser.info/json',
    'https://at1.api.radio-browser.info/json',
    'https://nl1.api.radio-browser.info/json',
    'https://all.api.radio-browser.info/json'
];

const getFastestMirror = async (): Promise<string> => {
    try {
        return 'https://all.api.radio-browser.info/json';
    } catch {
        return API_MIRRORS[Math.floor(Math.random() * API_MIRRORS.length)];
    }
};

const getCountryAliases = (name: string): string[] => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('united states') || nameLower === 'usa' || nameLower === 'us') {
    return ["USA", "United States", "United States of America"];
  }
  if (nameLower === 'canada') return ["Canada"];
  if (nameLower === 'mexico' || nameLower === 'méxico') return ["Mexico", "México"];
  if (nameLower.includes('dominican')) return ["Dominican Republic", "Dominican Rep."];
  if (nameLower === 'uruguay') return ["Uruguay"];
  if (nameLower === 'chile') return ["Chile"];
  if (nameLower === 'ecuador') return ["Ecuador"];
  if (nameLower === 'guam') return ["Guam"];
  if (nameLower === 'colombia') return ["Colombia"];
  if (nameLower === 'spain' || nameLower === 'españa') return ["Spain", "España"];
  if (nameLower.includes('antarctica')) return ["Antarctica", "Antártida"];
  return [name];
};

// --- BASE DE DATOS DE CURADURÍA MANUAL ---
const CURATED_STATIONS: Record<string, Partial<Station>[]> = {
  "USA": [
    { name: "670 The Score (WSCR)", url: "https://live.amperwave.net/manifest/audacy-wscramaac-hlsc.m3u8", city: "Chicago", tags: "sports,talk,news" },
    { name: "NPR News", url: "https://npr-ice.streamguys1.com/live.mp3", city: "Washington", tags: "news,talk,public" },
    { name: "KEXP 90.3", url: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3", city: "Seattle", tags: "alternative,indie" },
    { name: "KMNO 91.7 FM Mana'o Radio", url: "https://ice6.securenetsystems.net/KMNO", city: "Wailuku", state: "Hawaii", tags: "eclectic,community", geo_lat: 20.8893, geo_long: -156.4729 },
    { name: "93.5 KPOA", url: "https://pacificmedia.cdnstream1.com/2794_64.aac", city: "Lahaina", state: "Hawaii", tags: "hawaiian,reggae", geo_lat: 20.8783, geo_long: -156.6778 },
    { name: "Hi92 (KLHI-FM)", url: "https://pacificmedia.cdnstream1.com/2796_64.aac", city: "Kahului", state: "Hawaii", tags: "hits,pop", geo_lat: 20.8853, geo_long: -156.4592 }
  ],
  "Canada": [
    { name: "CHUM 104.5 FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CHUMFMAAC.aac", city: "Toronto", state: "Ontario", tags: "hits,pop,hot ac", geo_lat: 43.6532, geo_long: -79.3832 },
    { name: "JAZZ.FM91", url: "https://jazzfm91.streamb.live/SB00024", city: "Toronto", state: "Ontario", tags: "jazz,community", geo_lat: 43.6532, geo_long: -79.3832 },
    { name: "Sauga 960 AM", url: "https://us1.streamingpulse.com/ssl/7172", city: "Mississauga", state: "Ontario", tags: "talk,news,community", geo_lat: 43.5890, geo_long: -79.6441 },
    { name: "TSN 1050 (CHUM)", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CHUMAMAAC.aac", city: "Toronto", state: "Ontario", tags: "sports,talk,news" },
    { name: "Bounce Radio 92.3 FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CKXFMAAC.aac", city: "Owen Sound", state: "Ontario", tags: "hits,pop,variety" },
    { name: "Zoomer Radio 740 AM", url: "https://live.amperwave.net/manifest/mzmedia-cfzmamaac-hls2.m3u8", city: "Toronto", state: "Ontario", tags: "oldies,classic" },
    { name: "Ondas FM 91.9", url: "https://streaming1.locucionar.com/proxy/ondasfm?mp=/stream", city: "Toronto", tags: "spanish,latin,hits" },
    { name: "CHHA 1610 AM", url: "https://ice24.securenetsystems.net/CHHA", city: "Toronto", tags: "spanish,latin,community" }
  ],
  "Mexico": [
    { name: "Radio Turquesa", url: "https://stream.miradio.in/proxy/t1027/live", city: "Cancun", state: "Quintana Roo", tags: "hits,pop,variety", geo_lat: 21.1619, geo_long: -86.8515 }
  ],
  "Colombia": [
    { name: "Radio Uno Ibagué", url: "http://streamer5.rightclickitservices.com:9790/stream", city: "Ibagué", tags: "popular,vallenato,hits", geo_lat: 4.4333, geo_long: -75.2333 },
    { name: "Click Latino 99.5 FM", url: "https://radiohd2.streaminghd.co:7895/stream", city: "Cali", tags: "tropical,latin,hits", geo_lat: 3.4516, geo_long: -76.5320 },
    { name: "Candela Stereo Bogotá 101.9 FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CANDELAESTEREO.mp3", city: "Bogotá", tags: "tropical,popular,hits", geo_lat: 4.6097, geo_long: -74.0817 },
    { name: "Ecos del Combeima", url: "http://s2.viastreaming.net:8030/;", city: "Ibagué", tags: "news,talk,variety", geo_lat: 4.4333, geo_long: -75.2333 },
    { name: "Olímpica Stereo Armenia", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_ARMENIAAAC.aac", city: "Armenia", tags: "tropical,salsa,hits", geo_lat: 4.5350, geo_long: -75.6757 },
    { name: "Olímpica Stereo Cúcuta", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_CUCUTAAAC.aac", city: "Cúcuta", tags: "tropical,salsa,hits", geo_lat: 7.8939, geo_long: -72.5078 },
    { name: "Olímpica Stereo Santa Marta", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_SANTA_MARTAAAC.aac", city: "Santa Marta", tags: "tropical,salsa,hits", geo_lat: 11.2408, geo_long: -74.1990 },
    { name: "Olímpica Stereo Manizales", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_MANIZALESAAC.aac", city: "Manizales", tags: "tropical,salsa,hits", geo_lat: 5.0689, geo_long: -75.5174 },
    { name: "Olímpica Stereo Neiva", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_NEIVAAAC.aac", city: "Neiva", tags: "tropical,salsa,hits", geo_lat: 2.9273, geo_long: -75.2819 },
    { name: "Olímpica Stereo Valledupar", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_VALLEDUPARAAC.aac", city: "Valledupar", tags: "tropical,salsa,hits", geo_lat: 10.4631, geo_long: -73.2532 },
    { name: "Olímpica Stereo Pereira", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_PEREIRAAAC.aac", city: "Pereira", tags: "tropical,salsa,hits", geo_lat: 4.8133, geo_long: -75.6961 },
    { name: "Olímpica Stereo Villavicencio", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_VILLAVICENCIOAAC.aac", city: "Villavicencio", tags: "tropical,salsa,hits", geo_lat: 4.1420, geo_long: -73.6266 },
    { name: "La FM Plus Bucaramanga", url: "https://mdstrm.com/audio/632cc62fbc02c60329992b93/live.m3u8", city: "Bucaramanga", tags: "news,talk,hits", geo_lat: 7.1193, geo_long: -73.1227 },
    { name: "Alerta Cartagena 1270 AM", url: "https://mdstrm.com/audio/632cc8862f44cf6996467d24/live.m3u8", city: "Cartagena", tags: "news,community,talk", geo_lat: 10.3910, geo_long: -75.4794 },
    { name: "La 91 (Banco Magdalena)", url: "https://streaming.radiosenlinea.com.ar:10871/;", city: "El Banco", tags: "hits,pop,latin", geo_lat: 9.0007, geo_long: -73.9723 },
    { name: "Antena 2 Colombia", url: "https://mdstrm.com/audio/632c9b439234f869e9a50e2b/live.m3u8", city: "Bogotá", tags: "sports,news,talk", geo_lat: 4.7110, geo_long: -74.0721 },
    { name: "La FM Cali", url: "https://mdstrm.com/audio/632cb714202d6801a3178462/live.m3u8", city: "Cali", tags: "news,talk,pop", geo_lat: 3.4516, geo_long: -76.5320 },
    { name: "Tropicana Stereo Cartagena", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/TR_CARTAGENAAAC.aac", city: "Cartagena", tags: "tropical,salsa,hits", geo_lat: 10.3910, geo_long: -75.4794 },
    { name: "Caracol Radio Cartagena 1170 AM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CR_AM_CARTAGENA.mp3", city: "Cartagena", tags: "news,talk,sports", geo_lat: 10.3910, geo_long: -75.4794 },
    { name: "La Fm Cartagena 1000 AM", url: "https://mdstrm.com/audio/632cca662f44cf6996467d6c/live.m3u8", city: "Cartagena", tags: "news,talk,hits", geo_lat: 10.3910, geo_long: -75.4794 },
    { name: "La Mega Cartagena 94.5 FM", url: "https://mdstrm.com/audio/632cca2248f73909a614ac30/icecast.audio", city: "Cartagena", tags: "urban,reggaeton,pop", geo_lat: 10.3910, geo_long: -75.4794 },
    { name: "El Sol Cartagena 102.5 FM", url: "https://mdstrm.com/audio/632ccbb99234f869e9a51955/icecast.audio", city: "Cartagena", tags: "salsa,tropical", geo_lat: 10.3910, geo_long: -75.4794 },
    { name: "Emisora Minuto de Dios 89.5 FM", url: "https://stream.zeno.fm/4mty6w6y0u8uv", city: "Cartagena", tags: "religious,catholic", geo_lat: 10.3910, geo_long: -75.4794 },
    { name: "La Reina Cartagena 95.5 FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RNA_CARTAGENA.mp3?dist=oro_web", city: "Cartagena", tags: "vallenato,tropical", geo_lat: 10.3910, geo_long: -75.4794 }
  ],
  "Spain": [
    { name: "Antena 2000", url: "https://eu1.fastcast4u.com/proxy/antena2000?mp=/1", city: "Barcelona", tags: "hits,variety,latin", geo_lat: 41.3851, geo_long: 2.1734 }
  ],
  "Uruguay": [
    { name: "CX 12 Radio Oriental 770 AM", url: "http://radiolatina.live:7906/1", city: "Montevideo", tags: "talk,news,sports", geo_lat: -34.9011, geo_long: -56.1645 },
    { name: "Radio Galaxia 105.9 FM", url: "https://stream.zeno.fm/bf4gt1pem0quv", city: "Montevideo", tags: "pop,hits,dance", geo_lat: -34.9011, geo_long: -56.1645 }
  ],
  "Chile": [
    { name: "Radio Navarino 104.5 FM", url: "https://sonic.portalfoxmix.club/8130/stream", city: "Puerto Williams", tags: "community,talk,hits", geo_lat: -54.9333, geo_long: -67.6167 }
  ],
  "Ecuador": [
    { name: "Radio Caravana 750 AM", url: "https://streamingecuador.net:9006/stream", city: "Guayaquil", tags: "sports,talk,news", geo_lat: -2.1833, geo_long: -79.8833 },
    { name: "Sonorama FM", url: "https://stream.zeno.fm/pxbv57drdphvv", city: "Quito", tags: "news,talk,hits", geo_lat: -0.1807, geo_long: -78.4678 }
  ]
};

const mapApiDataToStation = (s: any): Station => ({
    stationuuid: s.stationuuid,
    name: s.name,
    url: s.url_resolved || s.url,
    url_resolved: s.url_resolved || s.url,
    homepage: s.homepage,
    favicon: s.favicon,
    tags: s.tags,
    country: s.country,
    countrycode: s.countrycode,
    state: s.state,
    city: s.city || '', 
    language: s.language,
    votes: s.votes,
    clickcount: s.clickcount,
    codec: s.codec,
    bitrate: s.bitrate,
    geo_lat: s.geo_lat || null,
    geo_long: s.geo_long || null
});

async function fetchFromEndpoint(baseUrl: string, endpoint: string, params: Record<string, string>): Promise<Station[]> {
    const urlParams = new URLSearchParams({
        hidebroken: 'true',
        limit: '1000',
        ...params
    });
    
    try {
        const response = await window.fetch(`${baseUrl}${endpoint}?${urlParams.toString()}`, {
             headers: { 'User-Agent': 'RadioOrbit/2.7' }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.map(mapApiDataToStation).filter((s: Station) => s.url_resolved);
    } catch (e) {
        return [];
    }
}

export const getStationsByCountry = async (countryCode: string, countryName: string): Promise<Station[]> => {
  const baseUrl = await getFastestMirror();
  const aliases = getCountryAliases(countryName);
  
  try {
    const apiPromises = [
        fetchFromEndpoint(baseUrl, '/stations/bycountrycodeexact/' + countryCode, { order: 'clickcount', reverse: 'true' }),
        fetchFromEndpoint(baseUrl, '/stations/bycountry/' + encodeURIComponent(countryName), { order: 'clickcount', reverse: 'true' })
    ];

    const results = await Promise.allSettled(apiPromises);
    const stations = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<Station[]>).value)
        .flat();

    const seen = new Set();
    const unique = stations.filter(s => {
        if (seen.has(s.stationuuid)) return false;
        seen.add(s.stationuuid);
        return true;
    });

    const manualKey = Object.keys(CURATED_STATIONS).find(k => k.toLowerCase() === countryName.toLowerCase() || aliases.some(a => a.toLowerCase() === k.toLowerCase()));
    const manualOnes = manualKey ? CURATED_STATIONS[manualKey].map(s => ({ 
        ...s, 
        stationuuid: `m-${Math.random().toString(36).substring(2, 11)}`, 
        country: manualKey, 
        countrycode: countryCode,
        url_resolved: s.url,
        codec: s.url?.includes('.m3u8') ? 'HLS' : (s.url?.includes('.aac') ? 'AAC' : 'MP3')
    } as Station)) : [];

    return [...manualOnes, ...unique].sort((a, b) => (b.clickcount || 0) - (a.clickcount || 0));
  } catch (error) {
    return [];
  }
};

export const searchGlobalStations = async (query: string): Promise<Station[]> => {
  const baseUrl = await getFastestMirror();
  return fetchFromEndpoint(baseUrl, '/stations/search', { 
    name: query, 
    limit: '500', 
    order: 'clickcount', 
    reverse: 'true' 
  });
};