import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/invitations/[id] - Get invitation details (for accept page)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invitation = await prisma.stashInvitation.findUnique({
      where: { id },
      include: {
        stash: {
          select: { name: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Verify this invitation is for the current user
    const isForUser =
      (invitation.userId && invitation.userId === session.user.id) ||
      (invitation.email && session.user.email?.toLowerCase() === invitation.email.toLowerCase());

    if (!isForUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: invitation.id,
      stashName: invitation.stash.name,
      stashId: invitation.stashId,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      isExpired: new Date() > invitation.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

// PATCH /api/invitations/[id] - Accept or decline invitation
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'decline'." },
        { status: 400 }
      );
    }

    const invitation = await prisma.stashInvitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Verify this invitation is for the current user
    const isForUser =
      (invitation.userId && invitation.userId === session.user.id) ||
      (invitation.email && session.user.email?.toLowerCase() === invitation.email.toLowerCase());

    if (!isForUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation is no longer pending" },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.stashInvitation.update({
        where: { id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Add user as member
      await prisma.$transaction([
        prisma.stashMember.create({
          data: {
            stashId: invitation.stashId,
            userId: session.user.id,
            role: "MEMBER",
          },
        }),
        prisma.stashInvitation.update({
          where: { id },
          data: { status: "ACCEPTED" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        stashId: invitation.stashId,
        message: "You have joined the stash",
      });
    } else {
      // Decline
      await prisma.stashInvitation.update({
        where: { id },
        data: { status: "DECLINED" },
      });

      return NextResponse.json({
        success: true,
        message: "Invitation declined",
      });
    }
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { error: "Failed to process invitation" },
      { status: 500 }
    );
  }
}
