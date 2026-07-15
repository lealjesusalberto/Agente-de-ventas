import React, { useState } from 'react';

const JobCard = ({ job, onVerifyPayment, onValidateFile, activeModule }) => {
  const [isDragging, setIsDragging] = useState(false);

  const getFileBadgeClass = (status) => {
    if (status.includes('Baja Resolución') || status.includes('Sin Archivo')) return 'error';
    if (status.includes('Requiere Edición')) return 'warning';
    return 'success';
  };

  const getPaymentBadgeClass = (status) => {
    return status === 'Pagado' ? 'success' : 'warning';
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('jobId', job.id);
    // Optional: make ghost image look nicer
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`glass-card job-card ${isDragging ? 'dragging' : ''}`} 
      data-status={job.status}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {job.thumbnailUrl && (
        <div className="job-thumbnail-container">
          <img src={job.thumbnailUrl} alt="Diseño cliente" className="job-thumbnail" />
        </div>
      )}
      <div className="job-header">
        <div>
          <div className="client-name">{job.clientName}</div>
          <span className={`client-type ${job.clientType.toLowerCase()}`}>
            {job.clientType}
          </span>
        </div>
      </div>
      
      <p className="job-description">{job.description}</p>
      
      <div className="job-details">
        <div className="detail-row">
          <span className="detail-label">{activeModule === 'hardware' ? 'Categoría:' : 'Material:'}</span>
          <span className="detail-value">{job.material}</span>
        </div>
        
        {activeModule !== 'hardware' && (
          <div className="detail-row">
            <span className="detail-label">Archivo:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status-badge ${getFileBadgeClass(job.fileStatus)}`}>
                {job.fileStatus}
              </span>
              {(job.fileStatus.includes('Sin Archivo') || job.fileStatus.includes('Baja Resolución')) && (
                <button 
                  onClick={() => onValidateFile && onValidateFile(job.id)}
                  style={{
                    background: 'var(--accent-violet)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  Validar
                </button>
              )}
            </span>
          </div>
        )}
        
        <div className="detail-row">
          <span className="detail-label">Pago:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-badge ${getPaymentBadgeClass(job.paymentStatus)}`}>
              {job.paymentStatus}
            </span>
            {job.paymentStatus !== 'Pagado' && (
              <button 
                onClick={() => onVerifyPayment(job.id)}
                style={{
                  background: 'var(--accent-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Verificar
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
