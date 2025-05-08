import { NextResponse } from "next/server";
import type { RegisterUserRequest } from "@/types/auth";

// This is a mock implementation - in a real app, you would connect to your actual backend
export async function POST(request: Request) {
  try {
    const body: RegisterUserRequest = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (!body.password || body.password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // In a real implementation, you would register the user in your backend
    // This is just a mock success response
    return NextResponse.json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
