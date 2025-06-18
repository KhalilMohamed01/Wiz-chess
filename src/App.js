import React, { useState } from 'react';
import './App.css';
import ChessboardComponent from './components/ChessboardComponent';
import EvaluationBar from './components/EvaluationBar';
import MovesList from './components/MovesList';
import PGNUploader from './components/PGNUploader';
import GameInfo from './components/GameInfo';

function App() {
  const [pgn, setPgn] = useState('');
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [evaluation, setEvaluation] = useState(0);

  const getFenForMoves = (movesArray) => {
    const { Chess } = require('chess.js');
    const tempGame = new Chess();
    movesArray.forEach((m) => tempGame.move(m));
    return tempGame.fen();
  };

  const fetchEvaluation = async (fen) => {
    try {
      const response = await fetch(
        `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const pv = data.pvs && data.pvs[0];
      if (!pv) return 0;
      if (pv.mate !== undefined && pv.mate !== null) {
        return pv.mate > 0 ? 100 : -100;
      }
      return pv.cp / 100;
    } catch (e) {
      console.error('Error fetching evaluation:', e);
      return 0;
    }
  };

  const handlePGNLoad = (loadedPgn) => {
    setPgn(loadedPgn);
    setCurrentMoveIndex(0);
    setMoves([]);
    setEvaluation(0);
    
    // Parse moves from the PGN
    if (loadedPgn) {
      try {
        const { Chess } = require('chess.js');
        const game = new Chess();
        game.loadPgn(loadedPgn);
        const history = game.history({ verbose: true });
        setMoves(history);
        const fen = getFenForMoves([]);
        fetchEvaluation(fen).then(setEvaluation);
      } catch (error) {
        console.error("Error loading PGN:", error);
      }
    }
  };

  const handleMovePlayed = (updatedMoves) => {
    setMoves(updatedMoves);
    setCurrentMoveIndex(updatedMoves.length);
    const fen = getFenForMoves(updatedMoves);
    fetchEvaluation(fen).then(setEvaluation);
  };

  const handleMoveClick = (index) => {
    setCurrentMoveIndex(index);
    const fen = getFenForMoves(moves.slice(0, index));
    fetchEvaluation(fen).then(setEvaluation);
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src="/logo1024.png" className="app-logo" alt="WizChess Logo" />
        <h1 className="app-title">WizChess</h1>
      </header>
      
      <div className="main-content">
        <div className="board-section">
          <EvaluationBar evaluation={evaluation} />
          <ChessboardComponent 
            pgn={pgn} 
            onMovePlayed={handleMovePlayed} 
            currentMoveIndex={currentMoveIndex}
          />
        </div>
        
        <div className="analysis-container">
          <div className="card">
            <h3 className="card-header">Game Info</h3>
            {pgn ? (
              <GameInfo pgn={pgn} />
            ) : (
              <PGNUploader onPGNLoad={handlePGNLoad} />
            )}
            {pgn && (
              <button 
                className="secondary" 
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={() => handlePGNLoad('')}
              >
                Load Different PGN
              </button>
            )}
          </div>
          
          {moves.length > 0 && (
            <div className="card">
              <h3 className="card-header">Moves</h3>
              <MovesList 
                moves={moves}
                currentMoveIndex={currentMoveIndex}
                onMoveClick={handleMoveClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
