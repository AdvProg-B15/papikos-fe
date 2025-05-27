import Navbar from "@/components/shared/Navbar"; // We'll create this next

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 text-center py-4">
        <p>© {new Date().getFullYear()} Papikos. All rights reserved.</p>
      </footer>
    </div>
  );
}