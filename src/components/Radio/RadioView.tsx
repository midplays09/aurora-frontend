'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Radio as RadioIcon, Search, Play, Pause, Loader2, Globe } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import api from '@/lib/api';
import type { RadioStation, RadioCountry, YouTubeTrack } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.4 } },
};

export default function RadioView() {
  const { currentTrack, isPlaying, playTrack, setIsPlaying } = usePlayerStore();
  
  const [countries, setCountries] = useState<RadioCountry[]>([]);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getRadioCountries().then((c) => {
      setCountries(c || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadStations();
  }, [selectedCountry]);

  const loadStations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getRadioStations(selectedCountry, 50, search);
      setStations(data || []);
    } catch { setStations([]); }
    setIsLoading(false);
  }, [selectedCountry, search]);

  const togglePlay = (station: RadioStation) => {
    if (currentTrack?.streamUrl === station.url) {
      setIsPlaying(!isPlaying);
    } else {
      const track: YouTubeTrack = {
        videoId: `radio-${station.id}`,
        title: station.name,
        channelName: station.country,
        thumbnail: station.favicon || '',
        duration: 0,
        streamUrl: station.url,
        isRadio: true,
      };
      playTrack(track);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(34,197,94,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RadioIcon size={18} style={{ color: '#22C55E' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: 0 }}>Radio</h1>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadStations()}
              placeholder="Search stations..."
              className="input"
              style={{ paddingLeft: 36 }}
            />
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="input"
            style={{ width: 180 }}
          >
            {countries.length === 0 && <option value="US">United States</option>}
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name} ({c.stationCount})</option>
            ))}
          </select>
        </div>
      </motion.div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
        </div>
      )}

      {!isLoading && stations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Globe size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No stations found</p>
        </div>
      )}

      {!isLoading && stations.length > 0 && (
        <motion.div
          variants={container} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}
        >
          {stations.map((station) => {
            const isActive = currentTrack?.streamUrl === station.url;
            const isStationPlaying = isActive && isPlaying;
            return (
              <motion.div
                key={station.id}
                variants={item}
                onClick={() => togglePlay(station)}
                className="card"
                style={{
                  padding: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderColor: isActive ? 'var(--accent)' : undefined,
                  boxShadow: isActive ? '0 0 0 1px var(--accent)' : undefined,
                }}
              >
                {/* Station icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, overflow: 'hidden',
                  background: 'var(--surface-hover)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {station.favicon ? (
                    <img
                      src={station.favicon}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <RadioIcon size={18} style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {station.name}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    {station.bitrate > 0 ? `${station.bitrate}kbps` : station.codec || 'Stream'}
                  </p>
                </div>

                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isActive ? 'var(--accent)' : 'var(--surface-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  flexShrink: 0,
                  transition: 'all 150ms ease',
                }}>
                  {isStationPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" style={{ marginLeft: 1 }} />}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
