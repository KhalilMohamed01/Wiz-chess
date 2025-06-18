import React, { useEffect, useRef } from 'react';

const MovesList = ({ moves, currentMoveIndex, onMoveClick }) => {
  const movesListRef = useRef(null);
  const activeRowRef = useRef(null);

  // Format moves into pairs (white move and black move)
  const formatMoves = () => {
    const formattedMoves = [];
    
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1] || null;
      
      formattedMoves.push({
        moveNumber,
        white: whiteMove,
        black: blackMove
      });
    }
    
    return formattedMoves;
  };
  
  const movePairs = formatMoves();

  // Scroll to active move whenever currentMoveIndex changes
  useEffect(() => {
    if (activeRowRef.current && movesListRef.current) {
      // Calculate position to keep the active move visible
      const container = movesListRef.current;
      const activeRow = activeRowRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeRow.getBoundingClientRect();
      
      // Check if active row is outside visible area
      if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom) {
        // Calculate scroll position to center the active row
        const scrollTop = activeRow.offsetTop - (container.clientHeight / 2) + (activeRow.clientHeight / 2);
        container.scrollTop = Math.max(0, scrollTop);
      }
    }
  }, [currentMoveIndex]);
  
  return (
    <div className="moves-list" ref={movesListRef}>
      {movePairs.map((pair) => {
        // Determine if this row contains the active move
        const isActiveRow = 
          currentMoveIndex === pair.moveNumber * 2 - 1 || 
          currentMoveIndex === pair.moveNumber * 2;
          
        return (
          <div 
            key={pair.moveNumber} 
            className="move-row"
            ref={isActiveRow ? activeRowRef : null}
          >
            <div className="move-number">{pair.moveNumber}.</div>
            <div 
              className={`move ${currentMoveIndex === pair.moveNumber * 2 - 1 ? 'active' : ''}`} 
              onClick={() => onMoveClick(pair.moveNumber * 2 - 1)}
            >
              {pair.white ? pair.white.san : ''}
            </div>
            {pair.black && (
              <div 
                className={`move ${currentMoveIndex === pair.moveNumber * 2 ? 'active' : ''}`} 
                onClick={() => onMoveClick(pair.moveNumber * 2)}
              >
                {pair.black.san}
              </div>
            )}
          </div>
        );
      })}    </div>
  );
};

export default MovesList;
