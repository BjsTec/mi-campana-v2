
const simulatedData = {
// webmaster
  webmaster: [
    {
      id: 1, 
      document_id: "80883111",
      nombre: 'Ivan Parra Casallas',
      password: "abc123",
      phone_number: '573112151924',
      role: 'Desarrollador',
    },
    {
      id: 2, 
      document_id: "1234567890",
      nombre: 'Alejandra Pachon',
      password: "abc123",
      phone_number: '573202967820',
      role: 'Administradora',
    },
  ],
  // Campañas
  campaign: [
    {
      id: 2001,
      nombre: 'Campaña Unida',
      email: 'unida@campana.com',
      phone_number: '573100000000',
      website: 'www.campanaunida.com',
      logo: 'logo_unida.png',
      status: 'activa',
      role: "senador",
      link_marketing: "",
      created_by_id: 1,
      created_at: '2024-01-20T08:00:00Z',
    },
     {
      id: 2002,
      nombre: 'Mapo',
      email: 'mapo@campana.com',
      phone_number: '573100000000',
      website: 'www.mapo.com',
      logo: 'logo_mapo.png',
      status: 'activa',
      role: "concejal",
      link_marketing: "",
      created_by_id: 2,
      created_at: '2024-01-20T08:00:00Z',
    },
  ],

  // users
  users: [
    {
      id: 1001,
      campaign_id: null, // Super Admin no está vinculado a una campaña específica
      nombre: 'Admin Supremo',
      email: 'admin.supremo@lacampana.com', // Mantengo el email por si es útil en el futuro, pero el login es por cedula
      password: 'password123', // Solo para simulación en frontend
      cedula: '0000000000', // Credencial de login
      whatsapp_number: '3000000000',
      phone_number: '3000000000',
      voting_station: 'N/A',
      country: 'Colombia',
      state: 'Bogota',
      city: 'Bogota',
      date_of_birth: '1975-01-01T00:00:00Z',
      role: 'super-admin', // Rol directo en la tabla users
      status: 'activo',
      verified: 'true', // Campo 'verified' existe en la tabla users
      owner_user_id: null,
      verified_user_by: null,
      created_user_by: null,
      created_at: '2024-01-01T10:00:00Z',
    },
    // Usuario Lider 1 (para Campaña 1, rol: lider)
    {
      id: 1004,
      campaign_id: 2001, // Vinculado a Campaña 1
      nombre: 'Lider de Campaña 1',
      email: 'lider1@campana1.com',
      password: 'password123',
      cedula: '1000000003', // Credencial de login
      whatsapp_number: '3000000003',
      phone_number: '3000000003',
      voting_station: 'Voto 1',
      country: 'Colombia',
      state: 'Cundinamarca',
      city: 'Fusagasuga',
      date_of_birth: '1988-04-01T00:00:00Z',
      role: 'lider', // Rol directo en la tabla users
      status: 'activo',
      verified: 'true',
      owner_user_id: 1001, // Su owner es el Super Admin (simulado)
      verified_user_by: 1001,
      created_user_by: 1001,
      created_at: '2024-02-01T09:00:00Z',
    },
    // Clientes Externos para Campaña 1 (3 usuarios para mantener 4 por campaña total)
    { id: 1005, campaign_id: 2001, nombre: 'Cliente C1-1', email: 'c1_1@mail.com', password: 'password123', cedula: '1000000004', whatsapp_number: '3000000004', phone_number: '3000000004', voting_station: 'Voto 1-1', country: 'Colombia', state: 'Cundinamarca', city: 'Fusagasuga', date_of_birth: '1995-05-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1004, verified_user_by: 1004, created_user_by: 1004, created_at: '2024-02-02T10:00:00Z' },
    { id: 1006, campaign_id: 2001, nombre: 'Cliente C1-2', email: 'c1_2@mail.com', password: 'password123', cedula: '1000000005', whatsapp_number: '3000000005', phone_number: '3000000005', voting_station: 'Voto 1-2', country: 'Colombia', state: 'Cundinamarca', city: 'Fusagasuga', date_of_birth: '1996-06-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1004, verified_user_by: 1004, created_user_by: 1004, created_at: '2024-02-03T11:00:00Z' },
    { id: 1007, campaign_id: 2001, nombre: 'Cliente C1-3', email: 'c1_3@mail.com', password: 'password123', cedula: '1000000006', whatsapp_number: '3000000006', phone_number: '3000000006', voting_station: 'Voto 1-3', country: 'Colombia', state: 'Cundinamarca', city: 'Fusagasuga', date_of_birth: '1997-07-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1004, verified_user_by: 1004, created_user_by: 1004, created_at: '2024-02-04T12:00:00Z' },

    // Usuario Lider 2 (para Campaña 2, rol: lider)
    {
      id: 1008,
      campaign_id: 2002, // Vinculado a Campaña 2
      nombre: 'Lider de Campaña 2',
      email: 'lider2@campana2.com',
      password: 'password123',
      cedula: '1000000007', // Credencial de login
      whatsapp_number: '3000000007',
      phone_number: '3000000007',
      voting_station: 'Voto 2',
      country: 'Colombia',
      state: 'Antioquia',
      city: 'Envigado',
      date_of_birth: '1989-08-01T00:00:00Z',
      role: 'lider',
      status: 'activo',
      verified: 'true',
      owner_user_id: 1001, // Su owner es el Super Admin (simulado)
      verified_user_by: 1001,
      created_user_by: 1001,
      created_at: '2024-03-01T13:00:00Z',
    },
    // Clientes Externos para Campaña 2 (3 usuarios)
    { id: 1009, campaign_id: 2002, nombre: 'Cliente C2-1', email: 'c2_1@mail.com', password: 'password123', cedula: '1000000008', whatsapp_number: '3000000008', phone_number: '3000000008', voting_station: 'Voto 2-1', country: 'Colombia', state: 'Antioquia', city: 'Envigado', date_of_birth: '1994-09-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1008, verified_user_by: 1008, created_user_by: 1008, created_at: '2024-03-02T14:00:00Z' },
    { id: 1010, campaign_id: 2002, nombre: 'Cliente C2-2', email: 'c2_2@mail.com', password: 'password123', cedula: '1000000009', whatsapp_number: '3000000009', phone_number: '3000000009', voting_station: 'Voto 2-2', country: 'Colombia', state: 'Antioquia', city: 'Envigado', date_of_birth: '1995-10-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1008, verified_user_by: 1008, created_user_by: 1008, created_at: '2024-03-03T15:00:00Z' },
    { id: 1011, campaign_id: 2002, nombre: 'Cliente C2-3', email: 'c2_3@mail.com', password: 'password123', cedula: '1000000010', whatsapp_number: '3000000010', phone_number: '3000000010', voting_station: 'Voto 2-3', country: 'Colombia', state: 'Antioquia', city: 'Envigado', date_of_birth: '1996-11-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1008, verified_user_by: 1008, created_user_by: 1008, created_at: '2024-03-04T16:00:00Z' },

    // Usuario Lider 3 (para Campaña 3, rol: lider)
    {
      id: 1012,
      campaign_id: 2003, // Vinculado a Campaña 3
      nombre: 'Lider de Campaña 3',
      email: 'lider3@campana3.com',
      password: 'password123',
      cedula: '1000000011', // Credencial de login
      whatsapp_number: '3000000011',
      phone_number: '3000000011',
      voting_station: 'Voto 3',
      country: 'Colombia',
      state: 'Valle del Cauca',
      city: 'Palmira',
      date_of_birth: '1990-12-01T00:00:00Z',
      role: 'lider',
      status: 'activo',
      verified: 'true',
      owner_user_id: 1001, // Su owner es el Super Admin (simulado)
      verified_user_by: 1001,
      created_user_by: 1001,
      created_at: '2024-04-01T17:00:00Z',
    },
    // Clientes Externos para Campaña 3 (3 usuarios)
    { id: 1013, campaign_id: 2003, nombre: 'Cliente C3-1', email: 'c3_1@mail.com', password: 'password123', cedula: '1000000012', whatsapp_number: '3000000012', phone_number: '3000000012', voting_station: 'Voto 3-1', country: 'Colombia', state: 'Valle del Cauca', city: 'Palmira', date_of_birth: '1998-01-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1012, verified_user_by: 1012, created_user_by: 1012, created_at: '2024-04-02T18:00:00Z' },
    { id: 1014, campaign_id: 2003, nombre: 'Cliente C3-2', email: 'c3_2@mail.com', password: 'password123', cedula: '1000000013', whatsapp_number: '3000000013', phone_number: '3000000013', voting_station: 'Voto 3-2', country: 'Colombia', state: 'Valle del Cauca', city: 'Palmira', date_of_birth: '1999-02-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1012, verified_user_by: 1012, created_user_by: 1012, created_at: '2024-04-03T19:00:00Z' },
    { id: 1015, campaign_id: 2003, nombre: 'Cliente C3-3', email: 'c3_3@mail.com', password: 'password123', cedula: '1000000014', whatsapp_number: '3000000014', phone_number: '3000000014', voting_station: 'Voto 3-3', country: 'Colombia', state: 'Valle del Cauca', city: 'Palmira', date_of_birth: '2000-03-01T00:00:00Z', role: 'cliente_externo', status: 'activo', verified: 'true', owner_user_id: 1012, verified_user_by: 1012, created_user_by: 1012, created_at: '2024-04-04T20:00:00Z' },
  ],


  // Coherente con: Tabla 'campaign' en DBML
  
  // Tablas vacías por ahora, se rellenarán cuando se necesiten funcionalidades específicas
  meeting: [],
  meeting_attendees: [],
  meeting_equipment: [],
  post: [],
  notes: [],
  rating: [],
  message: [],
};

export default simulatedData;
