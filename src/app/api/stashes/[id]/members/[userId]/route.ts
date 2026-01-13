import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string; userId: string }>;
}

// DELETE /api/stashes/[id]/members/[userId] - Remove a member (OWNER only) or leave (self)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: stashId, userId: targetUserId } = await params;

    // Get current user's membership
    const currentMembership = await prisma.stashMember.findUnique({
      where: { stashId_userId: { stashId, userId: session.user.id } },
    });

    if (!currentMembership) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get target membership
    const targetMembership = await prisma.stashMember.findUnique({
      where: { stashId_userId: { stashId, userId: targetUserId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check permissions
    const isSelf = session.user.id === targetUserId;
    const isOwner = currentMembership.role === "OWNER";
    const targetIsOwner = targetMembership.role === "OWNER";

    // Owner cannot leave (must delete stash or transfer ownership)
    if (isSelf && targetIsOwner) {
      return NextResponse.json(
        { error: "Owner cannot leave. Delete the stash or transfer ownership." },
        { status: 400 }
      );
    }

    // Non-owners can only remove themselves (leave)
    if (!isOwner && !isSelf) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if this is user's only stash when leaving
    if (isSelf) {
      const membershipCount = await prisma.stashMember.count({
        where: { userId: session.user.id },
      });

      if (membershipCount === 1) {
        return NextResponse.json(
          { error: "Cannot leave your only stash" },
          { status: 400 }
        );
      }
    }

    await prisma.stashMember.delete({
      where: { stashId_userId: { stashId, userId: targetUserId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

// PATCH /api/stashes/[id]/members/[userId] - Update member role (OWNER only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: stashId, userId: targetUserId } = await params;

    // Get current user's membership
    const currentMembership = await prisma.stashMember.findUnique({
      where: { stashId_userId: { stashId, userId: session.user.id } },
    });

    if (!currentMembership || currentMembership.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN or MEMBER." },
        { status: 400 }
      );
    }

    // Cannot change own role
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const member = await prisma.stashMember.update({
      where: { stashId_userId: { stashId, userId: targetUserId } },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}
