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
    'Red de talento certificado en Claude. Aplica, certifícate y trabaja en proyectos gestionados por Verymuch.ai.',
};

export default function HubPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#DDEAEE]">{children}</div>
  );
}
