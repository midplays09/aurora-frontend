import { fetchWithTimeout } from './utils';
import type { LyricsResult, SyncedLyricLine } from '@/types';

/**
 * Fetch lyrics from NetEase Cloud Music API.
 */
export async function fetchFromNetEase(title: string, artist: string): Promise<LyricsResult> {
  const q = encodeURIComponent(`${title} ${artist}`.trim());
  const res = await fetchWithTimeout(
    `https://netease-cloud-music-api-taupe-phi.vercel.app/search?keywords=${q}&limit=1`,
    4000
  );
  if (!res.ok) throw new Error('NetEase search failed');

  const song = (await res.json())?.result?.songs?.[0];
  if (!song) throw new Error('No song found');

  const lr = await fetchWithTimeout(
    `https://netease-cloud-music-api-taupe-phi.vercel.app/lyric?id=${song.id}`,
    4000
  );
  if (!lr.ok) throw new Error('NetEase lyrics failed');

  const lrc = (await lr.json())?.lrc?.lyric;
  if (!lrc || lrc.trim().length < 10) throw new Error('Empty lyrics');

  return { synced: lrc, source: 'NetEase' };
}

/**
 * Fetch lyrics from Musixmatch desktop API.
 */
export async function fetchFromMusixmatch(title: string, artist: string): Promise<LyricsResult> {
  const res = await fetchWithTimeout(
    `https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_synched&subtitle_format=mxm&app_id=web-desktop-app-v1.0&usertoken=190523f77464fba06fa5f82a9bfab0571dac14793a5b43571c3f8f5&q_track=${encodeURIComponent(title)}&q_artist=${encodeURIComponent(artist)}&page_size=1`,
    4000
  );
  if (!res.ok) throw new Error('Musixmatch failed');

  const body = (await res.json())?.message?.body?.macro_calls;
  const sub = body?.['track.subtitles.get']?.message?.body?.subtitle_list?.[0]?.subtitle;
  if (!sub?.subtitle_body) throw new Error('No subtitles');

  const lines = JSON.parse(sub.subtitle_body);
  const lrc = lines
    .map((l: any) => {
      const t = l.time;
      return `[${String(Math.floor(t.minutes)).padStart(2, '0')}:${String(Math.floor(t.seconds)).padStart(2, '0')}.${String(Math.floor(t.hundredths || 0)).padStart(2, '0')}]${l.text}`;
    })
    .join('\n');

  return { synced: lrc, source: 'Musixmatch' };
}

/**
 * Fetch lyrics from lrclib.net.
 */
export async function fetchFromLrclib(title: string, artist: string): Promise<LyricsResult> {
  const q = encodeURIComponent(`${artist} ${title}`.trim());
  const res = await fetchWithTimeout(`https://lrclib.net/api/search?q=${q}`, 6000);
  if (!res.ok) throw new Error('lrclib failed');

  const best = (await res.json())?.[0];
  if (!best) throw new Error('No results');

  if (best.syncedLyrics) return { synced: best.syncedLyrics, source: 'lrclib' };
  if (best.plainLyrics) return { plain: best.plainLyrics, source: 'lrclib' };
  throw new Error('No lyrics content');
}

/**
 * Parse LRC format into synced lyrics array.
 */
export function parseLRC(text: string): SyncedLyricLine[] {
  const lines: SyncedLyricLine[] = [];
  text.split('\n').forEach((line) => {
    const m = line.match(/\[(\d+):(\d+)[.:](\d+)\](.*)/);
    if (m) {
      const time = parseInt(m[1]) * 60 + parseFloat(m[2] + '.' + m[3]);
      const txt = m[4].trim();
      if (txt) lines.push({ time, text: txt });
    }
  });
  lines.sort((a, b) => a.time - b.time);
  return lines;
}

/**
 * Race all lyrics providers. First success wins.
 */
export async function fetchLyrics(title: string, artist: string): Promise<LyricsResult | null> {
  const cleanArtist = artist !== 'Unknown Artist' ? artist : '';
  try {
    const result = await Promise.any([
      fetchFromNetEase(title, cleanArtist),
      fetchFromMusixmatch(title, cleanArtist),
      fetchFromLrclib(title, cleanArtist),
    ]);
    return result;
  } catch {
    return null;
  }
}
