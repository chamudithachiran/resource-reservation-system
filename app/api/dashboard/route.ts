
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      totalResources,
      totalReservations,
      pendingReservations,
      approvedReservations,
      rejectedReservations,
      recentReservations,
      dashboardResources,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.resource.count(),

      prisma.reservation.count(),

      prisma.reservation.count({
        where: { status: "PENDING" },
      }),

      prisma.reservation.count({
        where: { status: "APPROVED" },
      }),

      prisma.reservation.count({
        where: { status: "REJECTED" },
      }),

      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          resource: true,
        },
      }),

      prisma.resource.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalResources,
        totalReservations,
        pendingReservations,
        approvedReservations,
        rejectedReservations,
        recentReservations,
        dashboardResources,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard data.",
      },
      { status: 500 }
    );
  }
}
