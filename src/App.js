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

  const fetchEvaluation = async (fen) => {
    try {
      const depth = 15;
      const url = `https://stockfish.online/api/stockfish.php?fen=${encodeURIComponent(fen)}&depth=${depth}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      let cp = 0;
      if (typeof data === 'object') {
        if (data.cp !== undefined) cp = data.cp;
        else if (data.score !== undefined) cp = data.score;
        else if (data.eval !== undefined) cp = data.eval;
        else if (data.analysis && data.analysis[0] && data.analysis[0].score !== undefined) {
          cp = data.analysis[0].score;
        }
      }
      const evalScore = parseFloat(cp) / 100;
      if (!isNaN(evalScore)) setEvaluation(evalScore);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    }
  };

  const handlePGNLoad = (loadedPgn) => {
    setPgn(loadedPgn);
    setCurrentMoveIndex(0);
    setMoves([]);
    setEvaluation(0);
    const { Chess } = require('chess.js');
    fetchEvaluation(new Chess().fen());

    // Parse moves from the PGN
    if (loadedPgn) {
      try {
        const game = new Chess();
        game.loadPgn(loadedPgn);
        setMoves(game.history({ verbose: true }));
      } catch (error) {
        console.error("Error loading PGN:", error);
      }
    }
  };

  const handleMovePlayed = (updatedMoves) => {
    setMoves(updatedMoves);
    setCurrentMoveIndex(updatedMoves.length);
    try {
      const { Chess } = require('chess.js');
      const game = new Chess();
      updatedMoves.forEach((m) => game.move(m));
      fetchEvaluation(game.fen());
    } catch (error) {
      console.error('Error processing move:', error);
    }
  };

  const handleMoveClick = (index) => {
    setCurrentMoveIndex(index);
    try {
      const { Chess } = require('chess.js');
      const game = new Chess();
      moves.slice(0, index).forEach((m) => game.move(m));
      fetchEvaluation(game.fen());
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    }
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
