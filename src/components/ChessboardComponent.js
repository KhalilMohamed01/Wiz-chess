import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessboardComponent = ({ pgn, onMovePlayed, currentMoveIndex }) => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const boardRef = useRef(null);
  
  useEffect(() => {
    if (!pgn) return;
    
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgn);
      setGame(newGame);
      setFen(newGame.fen());
      
      // Get all positions from game history
      const history = [];
      const tempGame = new Chess();
      
      // Add initial position
      history.push({
        fen: tempGame.fen(),
        move: null,
        moveNumber: 0
      });
      
      // Replay all moves to get each position
      const moves = newGame.history({ verbose: true });
      moves.forEach((move, index) => {
        tempGame.move(move);
        history.push({
          fen: tempGame.fen(),
          move: move,
          moveNumber: Math.floor(index / 2) + 1
        });
      });
      
      setMoveHistory(history);
    } catch (error) {
      console.error("Error loading PGN:", error);
    }
  }, [pgn]);
  
  // Handle navigation with keyboard
  const handleKeyDown = useCallback((event) => {
    if (!moveHistory.length) return;
    
    switch(event.key) {
      case 'ArrowLeft': // Previous move
        if (currentMoveIndex > 0) {
          onMovePlayed(moveHistory[currentMoveIndex - 1].move ? game.history({ verbose: true }).slice(0, currentMoveIndex - 1) : []);
        }
        break;
      case 'ArrowRight': // Next move
        if (currentMoveIndex < moveHistory.length - 1) {
          onMovePlayed(moveHistory[currentMoveIndex + 1].move ? game.history({ verbose: true }).slice(0, currentMoveIndex + 1) : []);
        }
        break;
      case 'ArrowUp': // First move
        onMovePlayed([]);
        break;
      case 'ArrowDown': // Last move
        onMovePlayed(game.history({ verbose: true }));
        break;
      default:
        break;
    }
  }, [currentMoveIndex, moveHistory, game, onMovePlayed]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  useEffect(() => {
    if (moveHistory.length === 0 || currentMoveIndex === undefined) return;
    
    const displayPosition = moveHistory[currentMoveIndex];
    if (displayPosition) {
      setFen(displayPosition.fen);
    }
  }, [currentMoveIndex, moveHistory]);

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to queen for simplicity
      });

      if (move === null) return false;
      
      setFen(game.fen());
      
      if (onMovePlayed) {
        onMovePlayed(game.history({ verbose: true }));
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const goToMove = (index) => {
    if (index >= 0 && index < moveHistory.length) {
      onMovePlayed(index === 0 ? [] : game.history({ verbose: true }).slice(0, index));
    }
  };
  return (
    <div className="chessboard-wrapper" ref={boardRef}>
      <Chessboard 
        position={fen} 
        onPieceDrop={onDrop} 
        boardWidth={750}
        customDarkSquareStyle={{ backgroundColor: '#444C56' }}
        customLightSquareStyle={{ backgroundColor: '#B9B9B9' }}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
        }}
      />
      
      <div className="move-controls">
        <button onClick={() => goToMove(0)} title="First Move" className="control-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => goToMove(Math.max(0, currentMoveIndex - 1))} title="Previous Move" className="control-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => goToMove(Math.min(moveHistory.length - 1, currentMoveIndex + 1))} title="Next Move" className="control-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => goToMove(moveHistory.length - 1)} title="Last Move" className="control-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChessboardComponent;
