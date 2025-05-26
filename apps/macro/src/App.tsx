import {useEffect, useState} from 'react';
import {Event, listen} from '@tauri-apps/api/event';
import './App.css';

interface MouseClick {
  x: number;
  y: number;
  button: string;
}

function App() {
  const [mouseEvents, setMouseEvents] = useState<MouseClick[]>([]);
  const [lastClick, setLastClick] = useState<MouseClick | null>(null);

  useEffect(() => {
    const setupListener = async () => {
      return await listen('mouse-click', (event: Event<MouseClick>) => {
        console.log('Received mouse click event:', event.payload);

        const {x, y, button} = event.payload;

        setLastClick({x, y, button});

        setMouseEvents(prev => {
          const newEvents = [{x, y, button}, ...prev];
          return newEvents.slice(0, 5);
        });
      });
    };

    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);

  return (
    <main className="h-full border-2 border-gray-300 bg-gray-800/90 p-4" data-tauri-drag-region>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Last Mouse Click</h2>

          {lastClick ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">X Position</p>
                  <p className="font-mono">{lastClick.x.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Y Position</p>
                  <p className="font-mono">{lastClick.y.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Button</p>
                  <p className="font-mono">{lastClick.button}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Waiting for mouse clicks...</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Mouse Events</h2>

          {mouseEvents.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">X</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Y</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Button</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {mouseEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 font-mono text-sm">{event.x.toFixed(2)}</td>
                    <td className="px-4 py-2 font-mono text-sm">{event.y.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm">{event.button}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No events recorded yet</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;