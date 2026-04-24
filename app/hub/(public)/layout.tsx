import type { Metadata } from 'next';

/**
 * Layout público del Hub. Dark mode + sin sidebar — brand público,
 * separado del dashboard interno. El admin (/hub/admin/*) tiene su
 * propio layout light-mode con sidebar.
 *
 * Los segmentos route-group (public) no afectan la URL: /hub/apply
 * mapea a app/hub/(public)/apply/page.tsx.
 */
export const metadata: Metadata = {
  title: 'Verymuch.ai Hub · Claude Certified Architect Program',
  description:
    'Programa Claude Certified Architect bajo Verymuch.ai. Comunidad de builders, certificación oficial y proyectos con scope cerrado. Construye con un equipo detrás.',
};

export default function HubPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#DDEAEE]">{children}</div>
  );
}
