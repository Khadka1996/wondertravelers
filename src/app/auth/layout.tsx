/**
 * 🔐 AUTH LAYOUT
 * Routes under /auth will not have header/footer automatically
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
