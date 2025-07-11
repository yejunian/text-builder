import { WorkProvider } from "@/contexts/work";

export default function WorkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <WorkProvider>
        <main className="container mx-auto max-w-2xl flex-1 p-4 md:p-6">
          {children}
        </main>
      </WorkProvider>
    </div>
  );
}
