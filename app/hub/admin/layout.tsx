import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { requireFounder } from '@/lib/auth/roles';

/**
 * Admin del Hub — light mode, comparte el shell del dashboard para coherencia
 * visual con el resto de operaciones internas. Solo founders.
 */
export default async function HubAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFounder();

  return (
    <div className="flex h-screen">
      <Sidebar isFounder={true} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#FAF9F7] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
