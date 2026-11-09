import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, label }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  let colorClass = 'progress-high';
  if (normalizedProgress < 30) {
    colorClass = 'progress-low';
  } else if (normalizedProgress < 60) {
    colorClass = 'progress-medium';
  }

  return (
    <div className="progress-container">
      {label && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          <span className="progress-percentage">{Math.round(normalizedProgress)}%</span>
        </div>
      )}
      <div className="progress-bar-bg">
        <div 
          className={`progress-bar-fill ${colorClass}`} 
          style={{ width: `${normalizedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
