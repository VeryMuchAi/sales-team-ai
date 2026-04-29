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
  title: 'Verymuch.ai Hub · Claude Certified Architect Foundations (CCAF)',
  description:
    'Verymuch.ai inicia el camino al Claude Partner Network. Necesitamos 10 builders CCAF certificados. Comunidad técnica, 4 cursos del CPN Learning Path y proyectos con scope cerrado.',
};

export default function HubPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#151514] text-[#F0EEE8]">{children}</div>
  );
}
