import React, { useRef, useState } from 'react';

const PGNUploader = ({ onPGNLoad }) => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState('');
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const pgn = event.target.result;
      onPGNLoad(pgn);
    };
    reader.readAsText(file);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const pgn = event.target.result;
        onPGNLoad(pgn);
      };
      reader.readAsText(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="file-upload">
      <div 
        className="upload-area"
        onClick={handleUploadClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#98C379" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 19H21" stroke="#98C379" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="upload-text">
          {fileName 
            ? `Selected file: ${fileName}` 
            : 'Drag & drop a PGN file or click to browse'}
        </p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pgn"
          style={{ display: 'none' }}
        />
      </div>
      {fileName && (
        <button className="secondary" onClick={() => {setFileName(''); onPGNLoad('');}}>
          Clear
        </button>
      )}
    </div>
  );
};

export default PGNUploader;
