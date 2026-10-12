
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch resources.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      !("type" in body) ||
      typeof body.name !== "string" ||
      typeof body.type !== "string" ||
      !body.name.trim() ||
      !body.type.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource name and type are required.",
        },
        { status: 400 },
      );
    }

    const name = body.name.trim();
    const type = body.type.trim();

    const description =
      "description" in body && typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const location =
      "location" in body && typeof body.location === "string"
        ? body.location.trim() || null
        : null;

    const capacity =
      "capacity" in body &&
      typeof body.capacity === "number" &&
      Number.isInteger(body.capacity) &&
      body.capacity > 0
        ? body.capacity
        : null;

    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        description,
        location,
        capacity,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Resource created successfully.",
        data: resource,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create resource:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create resource.",
      },
      { status: 500 },
    );
  }
}
