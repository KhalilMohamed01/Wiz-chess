import React, { useState } from 'react';
import './App.css';
import ChessboardComponent from './components/ChessboardComponent';
import EvaluationBar from './components/EvaluationBar';
import MovesList from './components/MovesList';
import PGNUploader from './components/PGNUploader';
import GameInfo from './components/GameInfo';
import useStockfish from './engine/useStockfish';

function App() {
  const [pgn, setPgn] = useState('');
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [evaluation, setEvaluation] = useState(0);
  const { analyze } = useStockfish();

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
        setMoves(game.history({ verbose: true }));
      } catch (error) {
        console.error("Error loading PGN:", error);
      }
    }
  };

  const handleMovePlayed = (updatedMoves) => {
    setMoves(updatedMoves);
    setCurrentMoveIndex(updatedMoves.length);

    const { Chess } = require('chess.js');
    const game = new Chess();
    updatedMoves.forEach((m) => game.move(m));
    analyze(game.fen()).then((evalScore) => {
      if (typeof evalScore === 'number') {
        setEvaluation(evalScore);
      }
    });
  };

  const handleMoveClick = (index) => {
    setCurrentMoveIndex(index);

    const { Chess } = require('chess.js');
    const game = new Chess();
    for (let i = 0; i < index; i += 1) {
      game.move(moves[i]);
    }
    analyze(game.fen()).then((evalScore) => {
      if (typeof evalScore === 'number') {
        setEvaluation(evalScore);
      }
    });
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
