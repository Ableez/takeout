import { UserSync } from "#/components/user-sync";
import { MobileNav } from "#/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <UserSync />
      <main className="pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
