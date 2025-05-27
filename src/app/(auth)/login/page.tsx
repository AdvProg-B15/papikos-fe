"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <p className="mb-4">Login form will go here.</p>
      {/* We will add ShadCN Form components later */}
      <Button asChild variant="link">
        <Link href="/">Back to Home</Link>
      </Button>
      <div className="mt-4">
        <span>Don't have an account? </span>
        <Link href="/register-tenant" className="text-blue-600 hover:underline">Register as Tenant</Link>
        <span> or </span>
        <Link href="/register-owner" className="text-blue-600 hover:underline">Register as Owner</Link>
      </div>
    </div>
  );
}