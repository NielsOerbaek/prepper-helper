import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Category } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") as Category | null;
    const search = searchParams.get("search");
    const expiringSoon = searchParams.get("expiringSoon") === "true";

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (expiringSoon) {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      where.expirationDate = {
        lte: sevenDaysFromNow,
        gte: new Date(),
      };
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        photos: true,
      },
      orderBy: [
        { expirationDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, quantity, expirationDate } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        userId: session.user.id,
        name,
        description,
        category: category || "OTHER",
        quantity: quantity || 1,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
      include: {
        photos: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
