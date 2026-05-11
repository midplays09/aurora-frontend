'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { RadioStation, RadioCountry } from '@/types';
import { usePlayerStore } from '@/store/playerStore';

export default function RadioView() {
  const [countries, setCountries] = useState<RadioCountry[]>([]);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('CA'); // Default Canada/US
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTracks, setCurrentIndex, setIsPlaying, currentView } = usePlayerStore();

  useEffect(() => {
    loadCountries();
    loadStations('CA');
  }, []);

  const loadCountries = async () => {
    try {
      const data = await api.getRadioCountries();
      setCountries(data.slice(0, 50)); // Top 50 by station count
    } catch (e) {
      console.error(e);
    }
  };

  const loadStations = async (countryCode: string, query = '') => {
    setLoading(true);
    try {
      const data = await api.getRadioStations(countryCode, 50, query);
      setStations(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStations(selectedCountry, search);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountry(code);
    loadStations(code, search);
  };

  const playStation = (station: RadioStation) => {
    // Map RadioStation to Track format for PlayerStore
    const track = {
      id: Date.now(),
      file: null,
      path: null,
      url: station.url,
      name: station.name,
      artist: `Live Radio • ${station.country}`,
      album: station.tags || 'Internet Radio',
      duration: 0, // Live stream has no duration
      artLoaded: false,
      lrcFile: null,
      lrcPath: null
    };

    setTracks([track]);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-4"></span>
            Live Radio
          </h1>
          <p className="text-white/50 mt-2">Listen to local stations worldwide</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <select 
            value={selectedCountry}
            onChange={handleCountryChange}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#24C8D8]"
          >
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search stations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-[#24C8D8] w-48"
          />
          <button type="submit" className="btn btn-primary px-4">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#24C8D8] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : stations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/40 border-2 border-dashed border-white/10 rounded-2xl">
          <svg className="w-12 h-12 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>
          <p>No stations found for this query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stations.map(station => (
            <div 
              key={station.id}
              onClick={() => playStation(station)}
              className="glass-panel p-4 flex items-center space-x-4 cursor-pointer hover:bg-white/10 transition-colors group"
            >
              <div className="w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
                {station.favicon ? (
                  <img src={station.favicon} alt={station.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                  <svg className="w-6 h-6 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-[#24C8D8]" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold truncate group-hover:text-[#24C8D8] transition-colors">{station.name}</h3>
                <p className="text-white/50 text-xs truncate mb-1">{station.tags || 'Various'}</p>
                <div className="flex items-center space-x-2 text-[10px] text-white/30 uppercase tracking-wider">
                  <span className="px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10">{station.codec || 'MP3'}</span>
                  <span>{station.bitrate} kbps</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
