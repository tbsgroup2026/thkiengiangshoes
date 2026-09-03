import RequireAuth from "@/components/RequireAuth";

export default function BusinessTripLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
