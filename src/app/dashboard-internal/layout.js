export default function InternalDashboardLayout({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
      }}
    >
      {/* Barra lateral o navegación del Dashboard Interno */}
      <aside
        style={{
          width: '220px',
          backgroundColor: '#e0e6ed',
          padding: '20px',
          borderRight: '1px solid #cdd5df',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <h2
          style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#2c3e50' }}
        >
          Menú Interno
        </h2>
        <a
          href="/dashboard-internal"
          style={{
            textDecoration: 'none',
            color: '#34495e',
            padding: '8px 0',
            fontWeight: 'bold',
          }}
        >
          Inicio Dashboard Interno
        </a>
        {/* Aquí irían otros enlaces de navegación para el equipo interno */}
      </aside>

      {/* Contenido principal del Dashboard Interno */}
      <main
        style={{
          flexGrow: 1,
          padding: '30px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          margin: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        {children}{' '}
        {/* Aquí se renderizará src/app/(dashboard-internal)/page.js */}
      </main>
    </div>
  )
}
