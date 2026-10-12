
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OVERLAP_CONSTRAINT =
  "reservation_no_overlapping_active_bookings";

function isReservationConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const prismaError = error as {
    code?: string;
    message?: string;
    meta?: {
      message?: string;
      constraint?: string;
    };
  };

  const errorText = [
    prismaError.message,
    prismaError.meta?.message,
    prismaError.meta?.constraint,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");

  return (
    errorText.includes(OVERLAP_CONSTRAINT) ||
    (prismaError.code === "P2004" &&
      errorText.toLowerCase().includes("exclusion")) ||
    (prismaError.code === "P2010" &&
      errorText.includes("23P01"))
  );
}

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Failed to fetch reservations:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reservations.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("userId" in body) ||
      !("resourceId" in body) ||
      !("startTime" in body) ||
      !("endTime" in body) ||
      typeof body.userId !== "string" ||
      !body.userId.trim() ||
      typeof body.resourceId !== "string" ||
      !body.resourceId.trim() ||
      typeof body.startTime !== "string" ||
      typeof body.endTime !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User, resource, start time and end time are required.",
        },
        { status: 400 },
      );
    }

    const userId = body.userId.trim();
    const resourceId = body.resourceId.trim();
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    if (
      !Number.isFinite(startTime.getTime()) ||
      !Number.isFinite(endTime.getTime()) ||
      startTime >= endTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid reservation dates and times.",
        },
        { status: 400 },
      );
    }

    const purpose =
      "purpose" in body && typeof body.purpose === "string"
        ? body.purpose.trim() || null
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return {
          status: 404,
          message: "User not found. Please create a user first.",
        };
      }

      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resource || !resource.isAvailable) {
        return {
          status: 400,
          message: "Resource not found or unavailable.",
        };
      }

      const conflict = await tx.reservation.findFirst({
        where: {
          resourceId,
          status: {
            in: ["PENDING", "APPROVED"],
          },
          startTime: {
            lt: endTime,
          },
          endTime: {
            gt: startTime,
          },
        },
        select: { id: true },
      });

      if (conflict) {
        return {
          status: 409,
          message: "This resource is already reserved for that time.",
        };
      }

      const reservation = await tx.reservation.create({
        data: {
          userId,
          resourceId,
          startTime,
          endTime,
          purpose,
          status: "PENDING",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          resource: {
            select: {
              id: true,
              name: true,
              type: true,
              location: true,
            },
          },
        },
      });

      return {
        status: 201,
        data: reservation,
      };
    });

    if ("message" in result) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reservation created successfully.",
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error) {
    if (isReservationConflict(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "This resource is already reserved for that time.",
        },
        { status: 409 },
      );
    }

    console.error("Failed to create reservation:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reservation.",
      },
      { status: 500 },
    );
  }
}
