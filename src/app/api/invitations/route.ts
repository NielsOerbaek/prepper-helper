import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/invitations - Get all pending invitations for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitations = await prisma.stashInvitation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { gt: new Date() },
        OR: [
          { userId: session.user.id },
          ...(session.user.email
            ? [{ email: session.user.email.toLowerCase() }]
            : []),
        ],
      },
      include: {
        stash: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      invitations.map((inv) => ({
        id: inv.id,
        stashId: inv.stashId,
        stashName: inv.stash.name,
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
