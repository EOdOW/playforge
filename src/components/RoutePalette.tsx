import { usePlayStore } from '../store/playStore';
import { useUIStore } from '../store/uiStore';
import { routeTemplates } from '../data/routes';
import { RouteTemplate } from '../types/play';

export function RoutePalette() {
  const selectedPlayerId = useUIStore((s) => s.selectedPlayerId);
  const currentPlay = usePlayStore((s) => s.currentPlay);
  const addRoute = usePlayStore((s) => s.addRoute);

  if (!selectedPlayerId || !currentPlay) return null;

  const player = currentPlay.players.find((p) => p.id === selectedPlayerId);
  if (!player) return null;

  // Check if player already has a route
  const existingRoute = currentPlay.routes.find((r) => r.playerId === selectedPlayerId);

  const assignRoute = (template: RouteTemplate) => {
    // Mirror control points for players on the right side of the field
    const isRightSide = player.x > 500;
    const controlPoints = template.defaultControlPoints.map((cp) => ({
      x: isRightSide ? -cp.x : cp.x,
      y: cp.y,
    }));

    addRoute({
      playerId: selectedPlayerId,
      type: template.type,
      controlPoints,
      style: 'solid',
    });
  };

  const categories = [
    { key: 'receiver', label: 'Receiver' },
    { key: 'rb', label: 'RB/FB' },
    { key: 'blocking', label: 'Blocking' },
  ] as const;

  return (
    <div className="absolute top-12 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-52">
      <div className="px-3 py-2 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          Routes for {player.label}
        </span>
        {existingRoute && (
          <span className="ml-2 text-xs text-gray-400">(has route)</span>
        )}
      </div>
      <div className="p-2 max-h-72 overflow-y-auto">
        {categories.map(({ key, label }) => {
          const routes = routeTemplates.filter((r) => r.category === key);
          return (
            <div key={key} className="mb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">
                {label}
              </div>
              {routes.map((rt) => (
                <button
                  key={rt.type}
                  onClick={() => assignRoute(rt)}
                  className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100"
                >
                  {rt.name}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
