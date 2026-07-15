import React, { useState, useRef } from 'react';
import './FileValidatorModal.css';

const FileValidatorModal = ({ onClose, onValidateSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageDims, setImageDims] = useState(null);
  
  const [targetWidthCm, setTargetWidthCm] = useState('');
  const [targetHeightCm, setTargetHeightCm] = useState('');
  
  const [result, setResult] = useState(null);
  
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImageDims({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleValidate = () => {
    if (!imageDims || !targetWidthCm || !targetHeightCm) return;
    
    // 1 inch = 2.54 cm
    const targetWidthInches = parseFloat(targetWidthCm) / 2.54;
    // const targetHeightInches = parseFloat(targetHeightCm) / 2.54;
    
    // Calculate DPI based on width (assuming aspect ratio is maintained)
    const dpi = Math.round(imageDims.width / targetWidthInches);
    
    let status = 'success';
    let message = 'Resolución óptima para impresión en gran formato.';
    
    if (dpi < 70) {
      status = 'error';
      message = '¡Peligro! Resolución muy baja. La imagen se verá pixelada.';
    } else if (dpi < 100) {
      status = 'warning';
      message = 'Resolución aceptable solo si se verá desde lejos (> 3 metros).';
    }

    setResult({ dpi, status, message });
  };

  const handleConfirm = () => {
    onValidateSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Validador de Archivo (IA)</h2>
        
        {!imageDims ? (
          <div 
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input 
              ref={inputRef}
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleChange}
            />
            <p>Arrastra la imagen aquí o haz clic para subir</p>
          </div>
        ) : (
          <div className="upload-zone" style={{ padding: '1rem' }} onClick={() => {setImageFile(null); setImageDims(null); setResult(null);}}>
            <p style={{ color: 'var(--accent-green)' }}>✓ Archivo cargado: {imageFile?.name}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Píxeles originales: {imageDims.width} x {imageDims.height}</p>
            <small style={{textDecoration: 'underline'}}>Clic para cambiar imagen</small>
          </div>
        )}

        <div className="measurements-form">
          <div className="input-group">
            <label>Ancho deseado (cm)</label>
            <input 
              type="number" 
              placeholder="Ej. 200"
              value={targetWidthCm}
              onChange={e => setTargetWidthCm(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Alto deseado (cm)</label>
            <input 
              type="number" 
              placeholder="Ej. 100"
              value={targetHeightCm}
              onChange={e => setTargetHeightCm(e.target.value)}
            />
          </div>
        </div>

        {!result ? (
          <button 
            className="btn-validate" 
            disabled={!imageDims || !targetWidthCm || !targetHeightCm}
            onClick={handleValidate}
          >
            Realizar Diagnóstico
          </button>
        ) : (
          <>
            <div className={`result-panel ${result.status}`}>
              <div>DPI Calculado: <span className="dpi-value" style={{color: result.status === 'success' ? '#10B981' : result.status === 'error' ? '#EF4444' : '#F59E0B'}}>{result.dpi}</span></div>
              <p>{result.message}</p>
            </div>
            {result.status === 'success' || result.status === 'warning' ? (
              <button 
                className="btn-validate" 
                style={{ marginTop: '1rem', background: 'var(--accent-green)' }}
                onClick={handleConfirm}
              >
                Aprobar y Actualizar Tarjeta
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default FileValidatorModal;
