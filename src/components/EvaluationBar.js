import React, { useEffect, useState } from 'react';

const EvaluationBar = ({ evaluation = 0 }) => {
  const [displayEval, setDisplayEval] = useState(evaluation);
  const [animating, setAnimating] = useState(false);
  
  // Animate the evaluation change
  useEffect(() => {
    if (displayEval !== evaluation) {
      setAnimating(true);
      
      // Create a smooth animation
      const start = displayEval;
      const end = evaluation;
      const duration = 400; // ms
      const startTime = performance.now();
      
      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * progress;
        
        setDisplayEval(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [evaluation, displayEval]);

  // Convert evaluation to a percentage (0-100) for the bar height
  // Cap at -5 to +5 for the scale
  const normalizedEval = Math.min(Math.max(displayEval, -5), 5);
  const percentage = ((normalizedEval + 5) / 10) * 100;
  
  // Display evaluation as +0.5 or -0.8, etc.
  const formattedEval = displayEval > 0 
    ? `+${displayEval.toFixed(1)}` 
    : displayEval.toFixed(1);
    
  return (
    <div className="evaluation-bar-container">
      <div 
        className={`evaluation-bar ${animating ? 'animating' : ''}`}
        style={{ height: `${percentage}%` }}
      />
      <div className="evaluation-value">
        {formattedEval}
      </div>
    </div>
  );
};

export default EvaluationBar;
