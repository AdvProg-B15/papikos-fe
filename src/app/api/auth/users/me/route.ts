import { NextResponse } from "next/server";
import type { UserDto } from "@/types/auth";

// This is a mock implementation - in a real app, you would connect to your actual backend
export async function GET(request: Request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // In a real implementation, you would validate the token and fetch the user
    // This is just a mock response
    const mockUser: UserDto = {
      userId: 1,
      email: "user@example.com",
      role: "TENANT",
      status: "ACTIVE",
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
