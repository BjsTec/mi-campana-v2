export default function ExternalClientDashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#e8f0f8' }}>
      {/* Barra lateral o navegación específica del Dashboard de Clientes */}
      <aside style={{
        width: '180px',
        backgroundColor: '#d8e5f2',
        padding: '15px',
        borderRight: '1px solid #b3cbe6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1a5276' }}>Menú Cliente</h2>
        <a href="/dashboard-external" style={{ textDecoration: 'none', color: '#21618c', padding: '6px 0', fontWeight: 'bold' }}>Mi Panel Cliente</a>
        {/* Aquí irían otros enlaces específicos para clientes */}
      </aside>

      {/* Contenido principal del Dashboard de Clientes */}
      <main style={{ flexGrow: 1, padding: '25px', backgroundColor: '#ffffff', borderRadius: '8px', margin: '15px', boxShadow: '0 3px 10px rgba(0,0,0,0.04)' }}>
        {children} {/* Aquí se renderizará src/app/(dashboard-external)/page.js */}
      </main>
    </div>
  )
}
