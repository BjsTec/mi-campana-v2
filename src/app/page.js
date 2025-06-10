export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#333', marginBottom: '20px' }}>
        ¡Bienvenido a La Campaña!
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Descubre lo que La Campaña tiene para ofrecerte.
      </p>
      <p style={{ marginTop: '20px' }}>
        <a href="/login" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>
          Ir a Iniciar Sesión
        </a>
      </p>
    </div>
  )
}