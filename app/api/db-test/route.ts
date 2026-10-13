
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$connect();

    const [users, resources, reservations] = await Promise.all([
      prisma.user.count(),
      prisma.resource.count(),
      prisma.reservation.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      counts: { users, resources, reservations },
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      { success: false, message: "Database connection failed." },
      { status: 500 },
    );
  }
}
