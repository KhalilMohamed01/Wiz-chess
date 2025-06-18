import React from 'react';

const GameInfo = ({ pgn }) => {
  if (!pgn) return null;
  
  // Parse PGN header tags
  const parseTags = (pgn) => {
    const tags = {};
    const tagRegex = /\[\s*(\w+)\s+"([^"]*)"\s*\]/g;
    let match;
    
    while ((match = tagRegex.exec(pgn)) !== null) {
      tags[match[1]] = match[2];
    }
    
    return tags;
  };
  
  const tags = parseTags(pgn);
  
  return (
    <div className="game-info">
      <div className="player-info">
        <div className="player-name">{tags.White || 'White'}</div>
        {tags.WhiteElo && <div className="player-rating">{tags.WhiteElo}</div>}
      </div>
      <div style={{ textAlign: 'center' }}>
        {tags.Result || '-'}
      </div>
      <div className="player-info" style={{ textAlign: 'right' }}>
        <div className="player-name">{tags.Black || 'Black'}</div>
        {tags.BlackElo && <div className="player-rating">{tags.BlackElo}</div>}
      </div>
    </div>
  );
};

export default GameInfo;
