import React from 'react';
import KanbanColumn from './KanbanColumn';

const columnsPrint = [
  { id: 'pending', title: 'Por Cotizar / Esperando Info' },
  { id: 'design', title: 'En Diseño / Edición' },
  { id: 'printing', title: 'En Impresión (Armado)' },
  { id: 'done', title: 'Acabados / Listo' }
];

const columnsHardware = [
  { id: 'pending', title: 'Por Cotizar' },
  { id: 'design', title: 'En Preparación' },
  { id: 'printing', title: 'En Despacho' },
  { id: 'done', title: 'Entregado' }
];

const KanbanBoard = ({ jobs, activeModule, onJobMove, onVerifyPayment, onValidateFile }) => {
  const columns = activeModule === 'hardware' ? columnsHardware : columnsPrint;

  return (
    <div className="kanban-board">
      {columns.map(col => (
        <KanbanColumn 
          key={col.id} 
          title={col.title} 
          statusId={col.id}
          jobs={jobs.filter(job => job.status === col.id)} 
          onJobMove={onJobMove}
          onVerifyPayment={onVerifyPayment}
          onValidateFile={onValidateFile}
          activeModule={activeModule}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
