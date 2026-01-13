import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { invitationEmail } from "@/lib/emails";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/stashes/[id]/invitations - Get all pending invitations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is OWNER or ADMIN
    const membership = await prisma.stashMember.findUnique({
      where: { stashId_userId: { stashId: id, userId: session.user.id } },
    });

    if (!membership || membership.role === "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invitations = await prisma.stashInvitation.findMany({
      where: { stashId: id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        userId: inv.userId,
        status: inv.status,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// POST /api/stashes/[id]/invitations - Send an invitation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: stashId } = await params;

    // Check if user is OWNER or ADMIN
    const membership = await prisma.stashMember.findUnique({
      where: { stashId_userId: { stashId, userId: session.user.id } },
    });

    if (!membership || membership.role === "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, userId, language = "en" } = body;

    // Get stash and inviter details for the email
    const stash = await prisma.stash.findUnique({
      where: { id: stashId },
    });

    if (!stash) {
      return NextResponse.json({ error: "Stash not found" }, { status: 404 });
    }

    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!email && !userId) {
      return NextResponse.json(
        { error: "Either email or userId is required" },
        { status: 400 }
      );
    }

    // If inviting by email, check if user already exists
    let targetUserId = userId;
    if (email && !userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        targetUserId = existingUser.id;
      }
    }

    // Check if target is already a member
    if (targetUserId) {
      const existingMember = await prisma.stashMember.findUnique({
        where: { stashId_userId: { stashId, userId: targetUserId } },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member" },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.stashInvitation.findFirst({
      where: {
        stashId,
        status: "PENDING",
        OR: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(targetUserId ? [{ userId: targetUserId }] : []),
        ],
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation is already pending" },
        { status: 400 }
      );
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.stashInvitation.create({
      data: {
        stashId,
        email: email?.toLowerCase() || null,
        userId: targetUserId || null,
        invitedBy: session.user.id,
        expiresAt,
      },
    });

    // Send invitation email if we have an email address
    const recipientEmail = email?.toLowerCase() || (targetUserId ? (await prisma.user.findUnique({ where: { id: targetUserId } }))?.email : null);

    if (recipientEmail) {
      try {
        const emailContent = invitationEmail({
          stashName: stash.name,
          inviterName: inviter?.name || inviter?.email || "Someone",
          inviterEmail: inviter?.email || "",
          invitationId: invitation.id,
          expiresAt,
          language: language as "da" | "en",
        });

        await resend.emails.send({
          from: FROM_EMAIL,
          to: recipientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
        // Don't fail the invitation creation if email fails
      }
    }

    return NextResponse.json(
      {
        id: invitation.id,
        email: invitation.email,
        userId: invitation.userId,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}

// DELETE /api/stashes/[id]/invitations?invitationId=xxx - Cancel an invitation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: stashId } = await params;
    const invitationId = request.nextUrl.searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json(
        { error: "invitationId is required" },
        { status: 400 }
      );
    }

    // Check if user is OWNER or ADMIN
    const membership = await prisma.stashMember.findUnique({
      where: { stashId_userId: { stashId, userId: session.user.id } },
    });

    if (!membership || membership.role === "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify invitation belongs to this stash
    const invitation = await prisma.stashInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.stashId !== stashId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.stashInvitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
}
