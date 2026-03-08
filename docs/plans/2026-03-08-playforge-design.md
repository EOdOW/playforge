# PlayForge Design Document

**Date:** 2026-03-08
**Project:** PlayForge — Custom American Football Play Creator
**Audience:** Youth/recreational football coaches

## Overview

PlayForge is a web app for creating custom American football plays. Coaches select a formation template, drag players into position, assign routes from a standard route tree, and adjust paths with control points. Plays are saved locally, exported as image/PDF, and shared via compressed URL links. No accounts or backend required for MVP.

## Tech Stack

- React 18 + TypeScript
- Konva.js + react-konva (canvas rendering, drag-and-drop)
- Vite (build tool)
- Zustand (state management + undo/redo)
- Tailwind CSS (UI styling)
- jsPDF (PDF export)
- lz-string (URL compression for shareable links)

## Field & Canvas

- HTML5 Canvas via Konva.js rendering a football field
- Green field with white yard lines (every 5 yards), numbers (every 10), hash marks, sidelines
- Default view shows roughly half the field from the line of scrimmage forward
- Draggable blue line of scrimmage
- Zoom and pan: pinch to zoom, two-finger drag to pan, single finger interacts with players/routes
- Undo/redo stack (Ctrl+Z / Ctrl+Y)
- Responsive — scales to fit browser window, touch-friendly
- Flat, clean visual style — no skeuomorphic textures

## Players & Formations

### Player Representation
- Offense: circles (O), colored blue, with optional position labels (QB, RB, WR, etc.)
- Defense: X shapes, colored red, with optional position labels (CB, LB, DE, etc.)
- Tap to select (highlight ring), drag to reposition
- Tap selected player for popover: set label, delete, assign route

### Formation Templates
- **Offense:** I-Formation, Shotgun, Single Back, Wishbone, Spread
- **Defense:** 4-3, 3-4, Cover 2, Cover 3, Man-to-Man shell
- Selecting a formation places all players in standard positions, then all are freely draggable

### Adding/Removing Players
- Toolbar buttons to add offensive or defensive players
- Delete via popover or drag off-field

## Routes & Assignments

### Route Palette
- **Receivers:** Slant, Post, Corner, Out, In, Curl, Go/Fly, Hitch, Drag, Wheel
- **RB/FB:** Flat, Swing, Check-and-release, Dive
- **Blocking:** Short thick line toward a defender

### Route Editing
- Routes are lines with draggable control points
- Drag control points to reshape: adjust break point, angle, depth
- Arrowheads show direction
- Solid lines for primary routes, dashed for optional/hot routes

### Run Plays
- Handoff lines: curved arrow from QB to ball carrier
- Blocking assignments: short arrows from OL toward defenders/zones
- Run lanes: shaded paths through the line

### Visual Clarity
- Routes color-matched to their player
- Selected route highlights in yellow
- Routes layer on top of players

## UI Layout

### Editor View
- **Top bar:** App name, editable play name, Save, Undo/Redo
- **Left sidebar:** Formation templates (collapsible), Offense/Defense tabs
- **Center:** Field canvas (maximum screen real estate)
- **Right sidebar:** Route palette (on player selection), player properties
- **Bottom bar:** Add player buttons, zoom controls

### Play List View
- Accessed via "My Plays" in top bar
- Simple list: play name, thumbnail preview, date modified
- Search/filter bar
- Tap to open, swipe to delete
- Prominent "New Play" button

### Responsive Behavior
- Smaller screens: sidebars become bottom sheets
- Formation picker becomes modal overlay
- Route palette appears as floating popover near selected player

### Color Scheme
- Dark top bar (charcoal/navy), white text
- Light gray background
- Green field, blue offense, red defense

## Saving, Sharing & Export

### Saving
- localStorage as JSON, auto-save on every change (debounced)
- Play data: name, formation, player positions, routes, line of scrimmage position, timestamp

### Shareable Links
- Play data serialized and compressed (lz-string) into URL hash fragment
- Opens in read-only view with "Copy to My Plays" button
- No backend required

### Export
- PNG via canvas `toDataURL()`
- PDF via jsPDF with play name header
- Print-friendly: white background variant for paper

### No Accounts
- Everything works locally, zero friction

## Project Structure

```
src/
  components/    -- React UI components (Toolbar, Sidebar, PlayList, etc.)
  canvas/        -- Konva canvas components (Field, Player, Route, etc.)
  store/         -- Zustand stores (playStore, uiStore)
  data/          -- Formation templates, route definitions
  utils/         -- Export helpers, URL encoding, constants
  types/         -- TypeScript types for play data model
```

## Data Model

```typescript
interface Play {
  id: string;
  name: string;
  scrimmageLineY: number;
  players: Player[];
  routes: Route[];
  createdAt: number;
  updatedAt: number;
}

interface Player {
  id: string;
  team: 'offense' | 'defense';
  position: string;       // e.g., 'QB', 'WR', 'CB'
  label: string;           // custom label
  x: number;
  y: number;
}

interface Route {
  id: string;
  playerId: string;
  type: string;            // e.g., 'slant', 'post', 'block'
  controlPoints: { x: number; y: number }[];
  style: 'solid' | 'dashed';
}
```
