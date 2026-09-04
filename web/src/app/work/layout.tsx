import RequireAuth from "@/components/RequireAuth";

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth publicSubPaths={["/work/kaizen/register"]}>
      {children}
    </RequireAuth>
  );
}
