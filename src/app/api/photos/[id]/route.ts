import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { deleteObject, minioClient, BUCKET_NAME } from "@/lib/minio";

async function verifyStashMembership(stashId: string, userId: string) {
  return prisma.stashMember.findUnique({
    where: { stashId_userId: { stashId, userId } },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Verify user is a member of the item's stash
    const isMember = await verifyStashMembership(photo.item.stashId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Stream the photo directly from MinIO
    const stream = await minioClient.getObject(BUCKET_NAME, photo.minioKey);
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": photo.mimeType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Verify user is a member of the item's stash
    const isMember = await verifyStashMembership(photo.item.stashId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from MinIO
    try {
      await deleteObject(photo.minioKey);
    } catch (err) {
      console.error("Failed to delete from MinIO:", err);
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
