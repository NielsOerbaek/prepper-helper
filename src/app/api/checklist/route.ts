import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DEFAULT_CHECKLIST_ITEMS } from "@/types";
import { Category } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has checklist items, if not create defaults
    const existingItems = await prisma.checklistItem.findMany({
      where: { userId: session.user.id },
    });

    if (existingItems.length === 0) {
      // Create default checklist items
      await prisma.checklistItem.createMany({
        data: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
          userId: session.user.id,
          name: item.name,
          category: item.category,
          isDefault: true,
        })),
      });
    }

    const items = await prisma.checklistItem.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
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
    const { name, category } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const item = await prisma.checklistItem.create({
      data: {
        userId: session.user.id,
        name,
        category: category as Category,
        isDefault: false,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isChecked, linkedItemId } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existingItem = await prisma.checklistItem.findUnique({
      where: { id },
    });

    if (!existingItem || existingItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = await prisma.checklistItem.update({
      where: { id },
      data: {
        ...(isChecked !== undefined && { isChecked }),
        ...(linkedItemId !== undefined && { linkedItemId }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existingItem = await prisma.checklistItem.findUnique({
      where: { id },
    });

    if (!existingItem || existingItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.checklistItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}
