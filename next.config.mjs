// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Agrega otros dominios aquí si es necesario (ej. Firebase Storage)
      // {
      //   protocol: 'https',
      //   hostname: 'firebasestorage.googleapis.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
    // HABILITA ESTO TEMPORALMENTE para que Next.js permita los SVG de placehold.co
    // ENTENDE QUE ESTO TIENE IMPLICACIONES DE SEGURIDAD EN PRODUCCIÓN SI NO CONTROLAS LAS FUENTES.
    dangerouslyAllowSVG: true,
    // Puedes dejar estas opciones para SVG, aunque la primera es la más importante
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
