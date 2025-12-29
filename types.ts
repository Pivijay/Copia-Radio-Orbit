export interface Station {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  city: string; // Added city
  language: string;
  votes: number;
  clickcount: number; // Added clickcount
  codec: string;
  bitrate: number;
  geo_lat: number | null; // Added latitude
  geo_long: number | null; // Added longitude
}

export interface CountryGeo {
  name: string;
  iso_a2: string; // ISO 2 char code
  iso_a3: string; // ISO 3 char code
  geometry: any; // GeoJSON geometry
}

export interface FilterState {
  countryCode: string | null;
  countryName: string | null;
  city: string | null; // The city name selected from map or search
  geoRegion: { lat: number; lng: number } | null; // For map zooming
  searchQuery: string;
}

export interface Recording {
  id: string;
  stationName: string;
  timestamp: number;
  duration: string;
  blobUrl: string;
  size: string;
}