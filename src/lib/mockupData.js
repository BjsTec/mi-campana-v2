// src/lib/mockupData.js

// Mockup Data: Datos simulados para el Panorama Electoral
const colombiaMapData = {
  meta: {
    totalVotos: 75000,
    totalPotenciales: 120000,
    totalPromesas: 90000,
    totalOpinion: {
      aFavor: 60,
      enContra: 20,
      indeciso: 20,
    },
  },
  departamentos: [
    {
      id: 'antioquia',
      name: 'Antioquia',
      votos: 12500,
      promesas: 15000,
      potenciales: 20000,
      ciudades: [
        { name: 'Medellín', votos: 8000, promesas: 10000, potenciales: 12000 },
        { name: 'Envigado', votos: 1500, promesas: 2000, potenciales: 3000 },
        { name: 'Rionegro', votos: 1000, promesas: 1500, potenciales: 2500 },
        { name: 'Apartadó', votos: 2000, promesas: 1500, potenciales: 2500 },
      ],
    },
    {
      id: 'valle-del-cauca',
      name: 'Valle del Cauca',
      votos: 10200,
      promesas: 13000,
      potenciales: 18000,
      ciudades: [
        { name: 'Cali', votos: 7000, promesas: 9000, potenciales: 12000 },
        { name: 'Palmira', votos: 1800, promesas: 2500, potenciales: 3500 },
        { name: 'Buga', votos: 1400, promesas: 1500, potenciales: 2500 },
      ],
    },
    {
      id: 'cundinamarca',
      name: 'Cundinamarca',
      votos: 15000,
      promesas: 20000,
      potenciales: 25000,
      ciudades: [
        { name: 'Bogotá', votos: 12000, promesas: 16000, potenciales: 20000 },
        { name: 'Soacha', votos: 1800, promesas: 2500, potenciales: 3000 },
        { name: 'Zipaquirá', votos: 1200, promesas: 1500, potenciales: 2000 },
      ],
    },
    {
      id: 'atlantico',
      name: 'Atlántico',
      votos: 8000,
      promesas: 10000,
      potenciales: 14000,
      ciudades: [
        {
          name: 'Barranquilla',
          votos: 6000,
          promesas: 8000,
          potenciales: 10000,
        },
        { name: 'Soledad', votos: 2000, promesas: 2000, potenciales: 4000 },
      ],
    },
    {
      id: 'santander',
      name: 'Santander',
      votos: 7000,
      promesas: 9000,
      potenciales: 11000,
      ciudades: [
        { name: 'Bucaramanga', votos: 5000, promesas: 6500, potenciales: 8000 },
        {
          name: 'Floridablanca',
          votos: 2000,
          promesas: 2500,
          potenciales: 3000,
        },
      ],
    },
    {
      id: 'nariño',
      name: 'Nariño',
      votos: 5000,
      promesas: 6000,
      potenciales: 8000,
      ciudades: [
        { name: 'Pasto', votos: 3500, promesas: 4000, potenciales: 5500 },
        { name: 'Ipiales', votos: 1500, promesas: 2000, potenciales: 2500 },
      ],
    },
    {
      id: 'amazonas',
      name: 'Amazonas',
      votos: 1000,
      promesas: 1200,
      potenciales: 1500,
      ciudades: [
        { name: 'Leticia', votos: 1000, promesas: 1200, potenciales: 1500 },
      ],
    },
    {
      id: 'arauca',
      name: 'Arauca',
      votos: 900,
      promesas: 1100,
      potenciales: 1300,
      ciudades: [
        { name: 'Arauca', votos: 900, promesas: 1100, potenciales: 1300 },
      ],
    },
    {
      id: 'bolivar',
      name: 'Bolívar',
      votos: 6000,
      promesas: 7500,
      potenciales: 9000,
      ciudades: [
        { name: 'Cartagena', votos: 6000, promesas: 7500, potenciales: 9000 },
      ],
    },
    {
      id: 'boyaca',
      name: 'Boyacá',
      votos: 3000,
      promesas: 4000,
      potenciales: 5000,
      ciudades: [
        { name: 'Tunja', votos: 3000, promesas: 4000, potenciales: 5000 },
      ],
    },
    {
      id: 'caldas',
      name: 'Caldas',
      votos: 2500,
      promesas: 3200,
      potenciales: 4000,
      ciudades: [
        { name: 'Manizales', votos: 2500, promesas: 3200, potenciales: 4000 },
      ],
    },
    {
      id: 'caqueta',
      name: 'Caquetá',
      votos: 1800,
      promesas: 2300,
      potenciales: 3000,
      ciudades: [
        { name: 'Florencia', votos: 1800, promesas: 2300, potenciales: 3000 },
      ],
    },
    {
      id: 'casanare',
      name: 'Casanare',
      votos: 1700,
      promesas: 2200,
      potenciales: 2800,
      ciudades: [
        { name: 'Yopal', votos: 1700, promesas: 2200, potenciales: 2800 },
      ],
    },
    {
      id: 'cauca',
      name: 'Cauca',
      votos: 3500,
      promesas: 4500,
      potenciales: 5800,
      ciudades: [
        { name: 'Popayán', votos: 3500, promesas: 4500, potenciales: 5800 },
      ],
    },
    {
      id: 'cesar',
      name: 'Cesar',
      votos: 4000,
      promesas: 5000,
      potenciales: 6500,
      ciudades: [
        { name: 'Valledupar', votos: 4000, promesas: 5000, potenciales: 6500 },
      ],
    },
    {
      id: 'choco',
      name: 'Chocó',
      votos: 1200,
      promesas: 1500,
      potenciales: 2000,
      ciudades: [
        { name: 'Quibdó', votos: 1200, promesas: 1500, potenciales: 2000 },
      ],
    },
    {
      id: 'cordoba',
      name: 'Córdoba',
      votos: 4800,
      promesas: 6000,
      potenciales: 7500,
      ciudades: [
        { name: 'Montería', votos: 4800, promesas: 6000, potenciales: 7500 },
      ],
    },
    {
      id: 'guainia',
      name: 'Guainía',
      votos: 500,
      promesas: 600,
      potenciales: 800,
      ciudades: [
        { name: 'Inírida', votos: 500, promesas: 600, potenciales: 800 },
      ],
    },
    {
      id: 'guaviare',
      name: 'Guaviare',
      votos: 700,
      promesas: 900,
      potenciales: 1200,
      ciudades: [
        {
          name: 'San José del Guaviare',
          votos: 700,
          promesas: 900,
          potenciales: 1200,
        },
      ],
    },
    {
      id: 'huila',
      name: 'Huila',
      votos: 3200,
      promesas: 4000,
      potenciales: 5200,
      ciudades: [
        { name: 'Neiva', votos: 3200, promesas: 4000, potenciales: 5200 },
      ],
    },
    {
      id: 'la-guajira',
      name: 'La Guajira',
      votos: 2800,
      promesas: 3500,
      potenciales: 4500,
      ciudades: [
        { name: 'Riohacha', votos: 2800, promesas: 3500, potenciales: 4500 },
      ],
    },
    {
      id: 'magdalena',
      name: 'Magdalena',
      votos: 5500,
      promesas: 7000,
      potenciales: 9000,
      ciudades: [
        { name: 'Santa Marta', votos: 5500, promesas: 7000, potenciales: 9000 },
      ],
    },
    {
      id: 'meta',
      name: 'Meta',
      votos: 6500,
      promesas: 8000,
      potenciales: 10000,
      ciudades: [
        {
          name: 'Villavicencio',
          votos: 6500,
          promesas: 8000,
          potenciales: 10000,
        },
      ],
    },
    {
      id: 'norte-de-santander',
      name: 'Norte de Santander',
      votos: 4200,
      promesas: 5200,
      potenciales: 6800,
      ciudades: [
        { name: 'Cúcuta', votos: 4200, promesas: 5200, potenciales: 6800 },
      ],
    },
    {
      id: 'putumayo',
      name: 'Putumayo',
      votos: 1500,
      promesas: 1900,
      potenciales: 2500,
      ciudades: [
        { name: 'Mocoa', votos: 1500, promesas: 1900, potenciales: 2500 },
      ],
    },
    {
      id: 'quindio',
      name: 'Quindío',
      votos: 1800,
      promesas: 2300,
      potenciales: 3000,
      ciudades: [
        { name: 'Armenia', votos: 1800, promesas: 2300, potenciales: 3000 },
      ],
    },
    {
      id: 'risaralda',
      name: 'Risaralda',
      votos: 2200,
      promesas: 2800,
      potenciales: 3500,
      ciudades: [
        { name: 'Pereira', votos: 2200, promesas: 2800, potenciales: 3500 },
      ],
    },
    {
      id: 'san-andres-providencia-y-santa-catalina',
      name: 'San Andrés, Providencia y Santa Catalina',
      votos: 300,
      promesas: 400,
      potenciales: 500,
      ciudades: [
        { name: 'San Andrés', votos: 300, promesas: 400, potenciales: 500 },
      ],
    },
    {
      id: 'sucre',
      name: 'Sucre',
      votos: 3800,
      promesas: 4800,
      potenciales: 6000,
      ciudades: [
        { name: 'Sincelejo', votos: 3800, promesas: 4800, potenciales: 6000 },
      ],
    },
    {
      id: 'tolima',
      name: 'Tolima',
      votos: 4500,
      promesas: 5500,
      potenciales: 7000,
      ciudades: [
        { name: 'Ibagué', votos: 4500, promesas: 5500, potenciales: 7000 },
      ],
    },
    {
      id: 'vichada',
      name: 'Vichada',
      votos: 600,
      promesas: 700,
      potenciales: 900,
      ciudades: [
        { name: 'Puerto Carreño', votos: 600, promesas: 700, potenciales: 900 },
      ],
    },
    {
      id: 'vaupes',
      name: 'Vaupés',
      votos: 400,
      promesas: 500,
      potenciales: 700,
      ciudades: [{ name: 'Mitú', votos: 400, promesas: 500, potenciales: 700 }],
    },
    {
      id: 'distrito-capital-de-bogota',
      name: 'Bogotá D.C.',
      votos: 12000,
      promesas: 16000,
      potenciales: 20000,
      ciudades: [
        { name: 'Bogotá', votos: 12000, promesas: 16000, potenciales: 20000 },
      ],
    },
  ],
}

// Colores de marca para los gráficos
const chartBrandColors = {
  primaryDefault: '#3084F2',
  primaryLight: '#61A3F7',
  primaryDark: '#102540',
  secondaryDefault: '#F2B90F',
  secondaryLight: '#FCE497',
  secondaryDark: '#CC9900',
  neutral50: '#FAFAFA',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral300: '#D1D5DB',
  neutral600: '#4B5563',
  neutral800: '#1F2937',
  errorDark: '#dc3545',
  successGreen: '#28a745',
  opinionColors: ['#28a745', '#dc3545', '#ffc107'],
}

export { colombiaMapData, chartBrandColors }
