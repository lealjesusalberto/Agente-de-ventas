import React, { useState } from 'react';
import JobCard from './JobCard';

const KanbanColumn = ({ title, jobs, statusId, onJobMove, onVerifyPayment, onValidateFile, activeModule }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId && onJobMove) {
      onJobMove(jobId, statusId);
    }
  };

  return (
    <div 
      className={`glass-panel kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragOver ? '2px dashed var(--accent-cyan)' : '1px solid var(--glass-border)',
        transition: 'border 0.2s ease'
      }}
    >
      <div className="column-header">
        <h2 className="column-title">{title}</h2>
        <span className="job-count">{jobs.length}</span>
      </div>
      
      <div className="column-content">
        {jobs.map(job => (
          <JobCard 
            key={job.id} 
            job={job} 
            onVerifyPayment={onVerifyPayment} 
            onValidateFile={onValidateFile}
            activeModule={activeModule}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
