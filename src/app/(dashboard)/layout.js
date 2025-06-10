// src/app/(dashboard)/layout.js
// Este archivo define el layout compartido para todas las rutas
// dentro del segmento (dashboard).

// Por defecto, los componentes de layout en el App Router de Next.js
// son Server Components.

export default function DashboardLayout({ children }) {
  return (
    // ¡IMPORTANTE! Las etiquetas <html>, <head> y <body> SOLO deben estar en el layout raíz (src/app/layout.js).
    // Este layout anidado solo proporciona la estructura INTERNA del dashboard.
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Barra lateral o navegación del dashboard */}
      <aside
        style={{
          width: '200px',
          backgroundColor: '#f0f0f0',
          padding: '20px',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Menú</h2>
        <a
          href="/dashboard"
          style={{
            textDecoration: 'none',
            color: '#333',
            padding: '5px 0',
          }}
        >
          Inicio Dashboard
        </a>
        <a
          href="/dashboard/candidato"
          style={{
            textDecoration: 'none',
            color: '#333',
            padding: '5px 0',
          }}
        >
          Candidatos
        </a>
        {/* Agrega más enlaces de navegación aquí */}
      </aside>

      {/* Contenido principal del dashboard */}
      <main style={{ flexGrow: 1, padding: '20px', backgroundColor: '#fff' }}>
        {children}{' '}
        {/* Aquí se renderizarán las páginas anidadas (como page.js o candidato/page.js) */}
      </main>
    </div>
  )
}
