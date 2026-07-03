/** @type {import('next').NextConfig} */
const TURNOS_CONSULTA_URL =
  "https://turnos-caja-centro-3972.web.app/turnos-consulta";

const nextConfig = {
  async redirects() {
    return [
      {
        source: "/turnos/consulta.html",
        destination: TURNOS_CONSULTA_URL,
        permanent: true,
      },
      {
        source: "/turnos/consulta",
        destination: TURNOS_CONSULTA_URL,
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
