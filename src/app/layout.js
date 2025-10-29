// src/app/layout.js
import { Montserrat, Open_Sans } from 'next/font/google';
import '../styles/globals.css'; // Asegúrate que esta ruta es correcta ahora que globals.css está en src/styles

const montserrat = Montserrat(/*...*/);
const openSans = Open_Sans(/*...*/);

export const metadata = {
  title: 'Mi Campaña V2',
  description: 'Gestión de Campañas Políticas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${openSans.variable}`}>
      <body>
         {/* Aquí ya NO va el AuthProvider */}
         {children}
      </body>
    </html>
  );
}