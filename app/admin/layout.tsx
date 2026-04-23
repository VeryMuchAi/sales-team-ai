import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { requireFounder } from '@/lib/auth/roles';

/**
 * Admin interno (solo founders). Light mode, shell idéntico al dashboard
 * para coherencia visual. Gatea por role = 'founder'.
 */
export default async function AdminLayout({
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
