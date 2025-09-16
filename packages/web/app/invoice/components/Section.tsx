export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="rounded-t-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        {title}
      </div>
      <div className="rounded-b-md border border-slate-900/10 p-4">
        {children}
      </div>
    </div>
  );
}