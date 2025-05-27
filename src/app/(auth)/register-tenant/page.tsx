"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RegisterTenantPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-6">Register as Tenant</h1>
      <p className="mb-4">Tenant registration form will go here.</p>
      <Button asChild variant="link">
        <Link href="/login">Already have an account? Login</Link>
      </Button>
      <Button asChild variant="link" className="mt-2">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}