import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/stashes - List all stashes where user is a member
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.stashMember.findMany({
      where: { userId: session.user.id },
      include: {
        stash: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });

    const stashes = memberships.map((m) => ({
      id: m.stash.id,
      name: m.stash.name,
      role: m.role,
      memberCount: m.stash._count.members,
    }));

    return NextResponse.json(stashes);
  } catch (error) {
    console.error("Error fetching stashes:", error);
    return NextResponse.json(
      { error: "Failed to fetch stashes" },
      { status: 500 }
    );
  }
}

// POST /api/stashes - Create a new stash
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Create stash with user as OWNER
    const stash = await prisma.stash.create({
      data: {
        name: name.trim(),
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(
      {
        id: stash.id,
        name: stash.name,
        role: "OWNER",
        memberCount: stash._count.members,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stash:", error);
    return NextResponse.json(
      { error: "Failed to create stash" },
      { status: 500 }
    );
  }
}
