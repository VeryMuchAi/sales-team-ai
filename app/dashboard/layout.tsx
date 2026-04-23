import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getAuthContext } from '@/lib/auth/roles';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  return (
    <div className="flex h-screen">
      <Sidebar isFounder={auth?.isFounder ?? false} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#FAF9F7] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
