/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'placehold.co',
      // 'otros-dominios.com', // Si tienes otros, también aquí
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Otras configuraciones de tu proyecto
}

export default nextConfig // ¡Esta es la línea corregida!
