import { NextResponse } from "next/server";
import type { LoginRequest, LoginResponse } from "@/types/auth";

// This is a mock implementation - in a real app, you would connect to your actual backend
export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    // In a real implementation, you would validate credentials against your backend
    // This is just a mock response
    // Check if the email contains "owner" to determine the role
    const isOwner = body.email.includes("owner");

    const mockResponse: LoginResponse = {
      accessToken: "mock-jwt-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        userId: 1,
        email: body.email,
        role: isOwner ? "OWNER" : "TENANT",
        status: "ACTIVE",
      },
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }
}
