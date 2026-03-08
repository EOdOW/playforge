import { Play } from '../types/play';

const STORAGE_KEY = 'playforge_plays';

export function loadPlays(): Play[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlays(plays: Play[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plays));
}

export function savePlay(play: Play): void {
  const plays = loadPlays();
  const index = plays.findIndex((p) => p.id === play.id);
  if (index >= 0) {
    plays[index] = play;
  } else {
    plays.push(play);
  }
  savePlays(plays);
}

export function deletePlay(id: string): void {
  const plays = loadPlays().filter((p) => p.id !== id);
  savePlays(plays);
}
