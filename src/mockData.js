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
  { category: 'Herramientas Manuales', items: ['Martillo de Uña - $12.50', 'Destornillador Estría - $4.00', 'Destornillador Plano - $4.00', 'Alicate Universal - $8.00', 'Llave Ajustable (Inglesa) - $15.00', 'Cinta Métrica 5m - $6.50'] },
  { category: 'Herramientas Eléctricas', items: ['Taladro Percutor - $45.00', 'Esmeril Angular - $35.00', 'Sierra Circular - $85.00', 'Lijadora Orbital - $40.00'] },
  { category: 'Tornillería y Fijación', items: ['Tornillo para Madera 2" (Caja) - $5.00', 'Tornillo Tirafondo (Caja) - $8.00', 'Clavos de Acero 3" (Caja) - $6.00', 'Tuercas Hexagonales (100u) - $4.00', 'Arandelas Planas (100u) - $3.00', 'Tacos Ramplug (Caja) - $5.50'] },
  { category: 'Pintura y Acabados', items: ['Pintura Clase A (Galón) - $25.00', 'Pintura Clase B (Galón) - $18.00', 'Pintura (Medio Galón) - $10.00', 'Brocha Pequeña 1" - $2.50', 'Brocha Grande 4" - $6.00', 'Rodillo Antigoteo - $8.50', 'Bandeja para Pintar - $4.00', 'Thinner (Galón) - $12.00'] },
  { category: 'Construcción', items: ['Cemento Portland (Saco) - $8.50', 'Arena Lavada (M3) - $20.00', 'Bloque de Arcilla (100u) - $45.00', 'Cabilla de 1/2" - $7.00', 'Alambre Dulce (Kg) - $3.50'] },
  { category: 'Plomería', items: ['Tubo PVC 1/2" - $4.00', 'Codo PVC 90° - $1.50', 'Teflón en Cinta - $0.80', 'Llave de Arresto - $5.00', 'Pegamento PVC - $4.50'] },
  { category: 'Electricidad', items: ['Cable THW N° 12 (Metro) - $1.20', 'Tomacorriente Doble - $3.50', 'Apagador Sencillo - $2.50', 'Breaker 20A - $6.00', 'Cinta Eléctrica 3M - $2.00'] }
];

export const storeProducts = [
  {
    id: 'p1',
    name: 'Martillo de Uña Forjado',
    code: 'HR-1001',
    price: 12.50,
    description: 'Martillo resistente con mango de goma antideslizante, ideal para carpintería.',
    image: 'https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?auto=format&fit=crop&w=400&q=80',
    stock: 24,
    category: 'Herramientas Manuales'
  },
  {
    id: 'p2',
    name: 'Taladro Percutor 750W',
    code: 'EL-2040',
    price: 45.00,
    description: 'Taladro eléctrico con función de percusión y velocidad variable. Incluye maletín.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    stock: 12,
    category: 'Herramientas Eléctricas'
  },
  {
    id: 'p3',
    name: 'Pintura Clase A Blanca (Galón)',
    code: 'PT-300',
    price: 25.00,
    description: 'Pintura acrílica lavable de alto rendimiento, acabado mate.',
    image: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?auto=format&fit=crop&w=400&q=80',
    stock: 40,
    category: 'Pintura y Acabados'
  },
  {
    id: 'p4',
    name: 'Brocha Profesional 4"',
    code: 'PT-305',
    price: 6.00,
    description: 'Brocha de cerdas naturales, ideal para acabados lisos en paredes grandes.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    stock: 100,
    category: 'Pintura y Acabados'
  },
  {
    id: 'p5',
    name: 'Set de Destornilladores (6 pzas)',
    code: 'HR-1050',
    price: 15.00,
    description: 'Juego de destornilladores estría y plano con punta magnética.',
    image: 'https://images.unsplash.com/photo-1542013063-e659b02d6b38?auto=format&fit=crop&w=400&q=80',
    stock: 18,
    category: 'Herramientas Manuales'
  },
  {
    id: 'p6',
    name: 'Caja de Clavos de Acero 3"',
    code: 'TR-500',
    price: 6.00,
    description: 'Caja de 1kg de clavos de acero galvanizado de alta resistencia.',
    image: 'https://images.unsplash.com/photo-1588691516086-4447c2111d51?auto=format&fit=crop&w=400&q=80',
    stock: 50,
    category: 'Tornillería y Fijación'
  }
];
