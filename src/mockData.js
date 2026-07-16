export const mockJobs = [
  {
    id: 'job-001',
    clientName: 'Juan Pérez',
    clientType: 'Nuevo',
    description: 'Banner para evento deportivo 2x1m',
    material: 'Ecosolvente (Banner 13oz)',
    status: 'pending', // pending, design, printing, done
    paymentStatus: 'Pendiente', // Pendiente, Pagado
    fileStatus: 'Sin Archivo', // Sin Archivo, Baja Resolución, Validado
    date: '2023-10-25T10:00:00Z',
  },
  {
    id: 'job-002',
    clientName: 'María Gómez',
    clientType: 'Frecuente',
    description: 'Etiquetas circulares para mermeladas',
    material: 'Vinil Autoadhesivo UV',
    status: 'design',
    paymentStatus: 'Pagado',
    fileStatus: 'Baja Resolución (Requiere Edición)',
    date: '2023-10-25T11:30:00Z',
  },
  {
    id: 'job-003',
    clientName: 'Agencia Crea',
    clientType: 'Frecuente',
    description: 'Fondo decorativo para stand (3x3m)',
    material: 'Tela Sublimada',
    status: 'printing',
    paymentStatus: 'Pagado',
    fileStatus: 'Validado',
    date: '2023-10-24T15:45:00Z',
  },
  {
    id: 'job-004',
    clientName: 'Carlos Ruiz',
    clientType: 'Nuevo',
    description: 'Franelas personalizadas (10 unds)',
    material: 'DTF Textil',
    status: 'done',
    paymentStatus: 'Pagado',
    fileStatus: 'Validado',
    date: '2023-10-22T09:15:00Z',
  },
];

export const mockHardwareOrders = [
  {
    id: 'order-001',
    clientName: 'Ferretería El Tornillo',
    clientType: 'Mayorista',
    description: 'Cajas de Tornillos 2"',
    material: 'Tornillos',
    status: 'pending', 
    paymentStatus: 'Pendiente', 
    fileStatus: 'N/A', 
    date: '2023-10-25T09:00:00Z',
  },
  {
    id: 'order-002',
    clientName: 'Pedro Constructora',
    clientType: 'Frecuente',
    description: 'Pintura Blanca Galón (5 unds)',
    material: 'Pintura',
    status: 'design', // Using 'design' as 'En Preparación' for hardware
    paymentStatus: 'Pagado',
    fileStatus: 'N/A',
    date: '2023-10-25T14:20:00Z',
  },
  {
    id: 'order-003',
    clientName: 'Luis Maestro',
    clientType: 'Nuevo',
    description: 'Martillo de Uña y Clavos',
    material: 'Herramientas',
    status: 'printing', // Using 'printing' as 'En Despacho' for hardware
    paymentStatus: 'Pagado',
    fileStatus: 'N/A',
    date: '2023-10-24T11:15:00Z',
  },
];

export const hardwareInventory = [
  { category: 'Herramientas Manuales', items: ['Martillo de Uña', 'Destornillador Estría', 'Destornillador Plano', 'Alicate Universal', 'Llave Ajustable (Inglesa)', 'Cinta Métrica 5m'] },
  { category: 'Herramientas Eléctricas', items: ['Taladro Percutor', 'Esmeril Angular', 'Sierra Circular', 'Lijadora Orbital'] },
  { category: 'Tornillería y Fijación', items: ['Tornillo para Madera 2"', 'Tornillo Tirafondo', 'Clavos de Acero 3"', 'Tuercas Hexagonales', 'Arandelas Planas', 'Tacos Ramplug'] },
  { category: 'Pintura y Acabados', items: ['Pintura Clase A (Galón)', 'Pintura Clase B (Galón)', 'Pintura (Medio Galón)', 'Brocha Pequeña 1"', 'Brocha Grande 4"', 'Rodillo Antigoteo', 'Bandeja para Pintar', 'Thinner (Galón)'] },
  { category: 'Construcción', items: ['Cemento Portland (Saco)', 'Arena Lavada (M3)', 'Bloque de Arcilla', 'Cabilla de 1/2"', 'Alambre Dulce (Kg)'] },
  { category: 'Plomería', items: ['Tubo PVC 1/2"', 'Codo PVC 90°', 'Teflón en Cinta', 'Llave de Arresto', 'Pegamento PVC'] },
  { category: 'Electricidad', items: ['Cable THW N° 12', 'Tomacorriente Doble', 'Apagador Sencillo', 'Breaker 20A', 'Cinta Eléctrica 3M'] }
];
