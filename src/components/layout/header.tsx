"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, MessageSquare } from "lucide-react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-teal-600">
            PapiKos
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/search" className="text-gray-600 hover:text-teal-600">
              Search Properties
            </Link>

            {isAuthenticated && user?.role === "OWNER" && (
              <>
                <Link
                  href="/my-properties"
                  className="text-gray-600 hover:text-teal-600"
                >
                  My Properties
                </Link>
                <Link
                  href="/owner-rentals"
                  className="text-gray-600 hover:text-teal-600"
                >
                  Rental Requests
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === "TENANT" && (
              <>
                <Link
                  href="/my-rentals"
                  className="text-gray-600 hover:text-teal-600"
                >
                  My Rentals
                </Link>
                <Link
                  href="/wishlist"
                  className="text-gray-600 hover:text-teal-600"
                >
                  Wishlist
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link
                  href="/chat"
                  className="text-gray-600 hover:text-teal-600 relative"
                >
                  <MessageSquare size={20} />
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-teal-100 text-teal-800">
                        {user?.email ? getInitials(user.email) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/balance">My Balance</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/search"
                className="text-gray-600 hover:text-teal-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Search Properties
              </Link>

              {isAuthenticated && user?.role === "OWNER" && (
                <>
                  <Link
                    href="/my-properties"
                    className="text-gray-600 hover:text-teal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Properties
                  </Link>
                  <Link
                    href="/owner-rentals"
                    className="text-gray-600 hover:text-teal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Rental Requests
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === "TENANT" && (
                <>
                  <Link
                    href="/my-rentals"
                    className="text-gray-600 hover:text-teal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Rentals
                  </Link>
                  <Link
                    href="/wishlist"
                    className="text-gray-600 hover:text-teal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link
                    href="/notifications"
                    className="text-gray-600 hover:text-teal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-teal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/balance"
                    className="text-gray-600 hover:text-teal-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Balance
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-teal-600"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
