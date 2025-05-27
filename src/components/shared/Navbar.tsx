"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { useAuth } from "@/store/authStore"; // We will create authStore later

export default function Navbar() {
  // const { user, logout } = useAuth(); // Example of how we might use auth state

  // Placeholder:
  const isAuthenticated = false; // Replace with actual auth check
  const user = null; // Replace with actual user object

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            Papikos
          </Link>
          <div className="space-x-4 flex items-center">
            <Button variant="ghost" asChild>
              <Link href="/kos">Browse Kos</Link>
            </Button>
            {isAuthenticated ? (
              <>
                {/* <span className="text-sm">Welcome, {user?.email}</span>
                <Button variant="ghost" onClick={logout}>Logout</Button> */}
                <span className="text-sm">Welcome! (Authenticated)</span>
                 <Button variant="ghost">Logout (Placeholder)</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register-tenant">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}