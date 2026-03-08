import lzString from 'lz-string';
import { Play } from '../types/play';

interface ShareablePlay {
  n: string;           // name
  s: number;           // scrimmageLineY
  p: [string, string, string, number, number][]; // [team, position, label, x, y]
  r: [number, string, [number, number][], string][]; // [playerIndex, type, controlPoints, style]
}

export function encodePlayToUrl(play: Play): string {
  const shareable: ShareablePlay = {
    n: play.name,
    s: play.scrimmageLineY,
    p: play.players.map((p) => [p.team[0], p.position, p.label, Math.round(p.x), Math.round(p.y)]),
    r: play.routes.map((r) => {
      const playerIndex = play.players.findIndex((p) => p.id === r.playerId);
      return [
        playerIndex,
        r.type,
        r.controlPoints.map((cp) => [Math.round(cp.x), Math.round(cp.y)] as [number, number]),
        r.style[0],
      ];
    }),
  };

  const json = JSON.stringify(shareable);
  const compressed = lzString.compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}#play=${compressed}`;
}

export function decodePlayFromUrl(hash: string): Play | null {
  try {
    const param = hash.replace('#play=', '');
    const json = lzString.decompressFromEncodedURIComponent(param);
    if (!json) return null;

    const s: ShareablePlay = JSON.parse(json);
    const players = s.p.map((p, i) => ({
      id: `shared-${i}`,
      team: (p[0] === 'o' ? 'offense' : 'defense') as 'offense' | 'defense',
      position: p[1],
      label: p[2],
      x: p[3],
      y: p[4],
    }));

    const routes = s.r.map((r, i) => ({
      id: `shared-route-${i}`,
      playerId: players[r[0]]?.id ?? '',
      type: r[1],
      controlPoints: r[2].map(([x, y]) => ({ x, y })),
      style: (r[3] === 's' ? 'solid' : 'dashed') as 'solid' | 'dashed',
    }));

    return {
      id: `shared-${Date.now()}`,
      name: s.n,
      scrimmageLineY: s.s,
      players,
      routes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
