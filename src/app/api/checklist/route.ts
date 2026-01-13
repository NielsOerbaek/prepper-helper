import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DEFAULT_CHECKLIST_ITEMS } from "@/types";
import { Category } from "@prisma/client";

// Helper to verify stash membership
async function verifyStashMembership(stashId: string, userId: string) {
  return prisma.stashMember.findUnique({
    where: { stashId_userId: { stashId, userId } },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stashId = request.nextUrl.searchParams.get("stashId");

    if (!stashId) {
      return NextResponse.json(
        { error: "stashId is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of this stash
    const membership = await verifyStashMembership(stashId, session.user.id);
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if stash has checklist items, if not create defaults
    const existingItems = await prisma.checklistItem.findMany({
      where: { stashId },
    });

    if (existingItems.length === 0) {
      // Create default checklist items for this stash
      await prisma.checklistItem.createMany({
        data: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
          stashId,
          name: item.name,
          category: item.category,
          isDefault: true,
        })),
      });
    }

    const items = await prisma.checklistItem.findMany({
      where: { stashId },
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
    const { name, category, stashId } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    if (!stashId) {
      return NextResponse.json(
        { error: "stashId is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of this stash
    const membership = await verifyStashMembership(stashId, session.user.id);
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const item = await prisma.checklistItem.create({
      data: {
        stashId,
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

    if (!existingItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify user is a member of this stash
    const membership = await verifyStashMembership(existingItem.stashId, session.user.id);
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    if (!existingItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify user is a member of this stash
    const membership = await verifyStashMembership(existingItem.stashId, session.user.id);
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
