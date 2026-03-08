import { RouteTemplate } from '../types/play';

// Control points are relative offsets from the player's position
// y is negative = upfield (toward opponent's end zone)

export const routeTemplates: RouteTemplate[] = [
  // Receiver routes
  {
    name: 'Slant',
    type: 'slant',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -30 },
      { x: 60, y: -80 },
    ],
  },
  {
    name: 'Post',
    type: 'post',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: 40, y: -140 },
    ],
  },
  {
    name: 'Corner',
    type: 'corner',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: -60, y: -140 },
    ],
  },
  {
    name: 'Out',
    type: 'out',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: -80, y: -60 },
    ],
  },
  {
    name: 'In',
    type: 'in',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -60 },
      { x: 80, y: -60 },
    ],
  },
  {
    name: 'Curl',
    type: 'curl',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -80 },
      { x: 0, y: -65 },
    ],
  },
  {
    name: 'Go/Fly',
    type: 'go',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -150 },
    ],
  },
  {
    name: 'Hitch',
    type: 'hitch',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -40 },
      { x: 0, y: -30 },
    ],
  },
  {
    name: 'Drag',
    type: 'drag',
    category: 'receiver',
    defaultControlPoints: [
      { x: 0, y: -20 },
      { x: 120, y: -20 },
    ],
  },
  {
    name: 'Wheel',
    type: 'wheel',
    category: 'receiver',
    defaultControlPoints: [
      { x: -30, y: -10 },
      { x: -40, y: -60 },
      { x: 0, y: -150 },
    ],
  },
  // RB/FB routes
  {
    name: 'Flat',
    type: 'flat',
    category: 'rb',
    defaultControlPoints: [
      { x: -60, y: -20 },
    ],
  },
  {
    name: 'Swing',
    type: 'swing',
    category: 'rb',
    defaultControlPoints: [
      { x: -30, y: 10 },
      { x: -80, y: -30 },
    ],
  },
  {
    name: 'Check & Release',
    type: 'check-release',
    category: 'rb',
    defaultControlPoints: [
      { x: 0, y: -10 },
      { x: 40, y: -60 },
    ],
  },
  {
    name: 'Dive',
    type: 'dive',
    category: 'rb',
    defaultControlPoints: [
      { x: 20, y: -50 },
    ],
  },
  // Blocking
  {
    name: 'Block',
    type: 'block',
    category: 'blocking',
    defaultControlPoints: [
      { x: 0, y: -25 },
    ],
  },
];
