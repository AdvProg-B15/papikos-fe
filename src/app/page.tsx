import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Papikos</h1>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/kos">Browse Kos</Link>
        </Button>
      </div>
       <div className="mt-8 space-x-4">
        <Button variant="secondary" asChild>
          <Link href="/register-tenant">Register as Tenant</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/register-owner">Register as Owner</Link>
        </Button>
      </div>
    </main>
  );
}
