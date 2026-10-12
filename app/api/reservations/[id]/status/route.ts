
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Reservation ID is required." },
        { status: 400 }
      );
    }

    let body: { status?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const status = body.status;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "Status must be APPROVED or REJECTED.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const reservation = await tx.reservation.findUnique({
          where: { id },
          include: { resource: true },
        });

        if (!reservation) {
          return {
            statusCode: 404,
            body: {
              success: false,
              error: "Reservation not found.",
            },
          };
        }

        if (reservation.status !== "PENDING") {
          return {
            statusCode: 409,
            body: {
              success: false,
              error: "Only pending reservations can be updated.",
            },
          };
        }

        if (status === "APPROVED") {
          if (!reservation.resource.isAvailable) {
            return {
              statusCode: 409,
              body: {
                success: false,
                error: "This resource is currently unavailable.",
              },
            };
          }

          const conflict = await tx.reservation.findFirst({
            where: {
              id: { not: reservation.id },
              resourceId: reservation.resourceId,
              status: "APPROVED",
              startTime: { lt: reservation.endTime },
              endTime: { gt: reservation.startTime },
            },
            select: { id: true },
          });

          if (conflict) {
            return {
              statusCode: 409,
              body: {
                success: false,
                error:
                  "This reservation overlaps with an already approved booking.",
              },
            };
          }
        }

        const updated = await tx.reservation.updateMany({
          where: {
            id,
            status: "PENDING",
          },
          data: { status },
        });

        if (updated.count === 0) {
          return {
            statusCode: 409,
            body: {
              success: false,
              error:
                "Reservation status changed. Refresh and try again.",
            },
          };
        }

        const updatedReservation =
          await tx.reservation.findUnique({
            where: { id },
            include: {
              user: true,
              resource: true,
            },
          });

        return {
          statusCode: 200,
          body: {
            success: true,
            message: `Reservation ${status.toLowerCase()} successfully.`,
            data: updatedReservation,
          },
        };
      },
      {
        isolationLevel: "Serializable",
      }
    );

    return NextResponse.json(result.body, {
      status: result.statusCode,
    });
  } catch (error) {
    console.error("Reservation status update error:", error);

    const prismaError = error as { code?: string };

    if (prismaError.code === "P2034") {
      return NextResponse.json(
        {
          success: false,
          error:
            "A concurrent reservation update occurred. Refresh and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update reservation status.",
      },
      { status: 500 }
    );
  }
}
