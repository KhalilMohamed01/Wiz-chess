import { useEffect, useRef } from 'react';

const STOCKFISH_URL = 'https://cdn.jsdelivr.net/npm/stockfish/stockfish.js';

export default function useStockfish() {
  const engineRef = useRef(null);

  useEffect(() => {
    const worker = new Worker(STOCKFISH_URL);
    worker.postMessage('uci');
    engineRef.current = worker;
    return () => {
      worker.terminate();
    };
  }, []);

  const analyze = (fen, depth = 12) => new Promise((resolve) => {
    const worker = engineRef.current;
    if (!worker) {
      resolve(0);
      return;
    }

    const handleMessage = (event) => {
      const text = event.data;
      if (typeof text === 'string') {
        if (text.startsWith('info') && text.includes('score cp')) {
          const match = text.match(/score cp (-?\d+)/);
          if (match) {
            const cp = parseInt(match[1], 10);
            worker.removeEventListener('message', handleMessage);
            worker.postMessage('stop');
            resolve(cp / 100);
          }
        }
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });

  return { analyze };
}
