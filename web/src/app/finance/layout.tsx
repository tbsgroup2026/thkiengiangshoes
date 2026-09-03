import RequireAuth from "@/components/RequireAuth";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
