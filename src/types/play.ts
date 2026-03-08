export interface Point {
  x: number;
  y: number;
}

export type Team = 'offense' | 'defense';
export type RouteStyle = 'solid' | 'dashed';

export interface Player {
  id: string;
  team: Team;
  position: string;
  label: string;
  x: number;
  y: number;
}

export interface Route {
  id: string;
  playerId: string;
  type: string;
  controlPoints: Point[];
  style: RouteStyle;
}

export interface Play {
  id: string;
  name: string;
  scrimmageLineY: number;
  players: Player[];
  routes: Route[];
  createdAt: number;
  updatedAt: number;
}

export interface Formation {
  name: string;
  team: Team;
  players: Omit<Player, 'id'>[];
}

export interface RouteTemplate {
  name: string;
  type: string;
  category: 'receiver' | 'rb' | 'blocking';
  defaultControlPoints: Point[];
}
