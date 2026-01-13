import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to check membership and role
async function getMembership(stashId: string, userId: string) {
  return prisma.stashMember.findUnique({
    where: { stashId_userId: { stashId, userId } },
  });
}

// GET /api/stashes/[id] - Get stash details with members
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const membership = await getMembership(id, session.user.id);
    if (!membership) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const stash = await prisma.stash.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        invitations: {
          where: { status: "PENDING" },
        },
        _count: { select: { items: true, checklistItems: true } },
      },
    });

    if (!stash) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: stash.id,
      name: stash.name,
      role: membership.role,
      members: stash.members.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.createdAt,
      })),
      pendingInvitations: stash.invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        userId: inv.userId,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
      })),
      itemCount: stash._count.items,
      checklistCount: stash._count.checklistItems,
    });
  } catch (error) {
    console.error("Error fetching stash:", error);
    return NextResponse.json(
      { error: "Failed to fetch stash" },
      { status: 500 }
    );
  }
}

// PATCH /api/stashes/[id] - Update stash name (OWNER or ADMIN only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const membership = await getMembership(id, session.user.id);
    if (!membership) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const stash = await prisma.stash.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ id: stash.id, name: stash.name });
  } catch (error) {
    console.error("Error updating stash:", error);
    return NextResponse.json(
      { error: "Failed to update stash" },
      { status: 500 }
    );
  }
}

// DELETE /api/stashes/[id] - Delete stash (OWNER only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const membership = await getMembership(id, session.user.id);
    if (!membership) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (membership.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if this is the user's only stash
    const stashCount = await prisma.stashMember.count({
      where: { userId: session.user.id },
    });

    if (stashCount === 1) {
      return NextResponse.json(
        { error: "Cannot delete your only stash" },
        { status: 400 }
      );
    }

    await prisma.stash.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stash:", error);
    return NextResponse.json(
      { error: "Failed to delete stash" },
      { status: 500 }
    );
  }
}
