import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { minioClient, BUCKET_NAME, ensureBucket } from "@/lib/minio";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const itemId = formData.get("itemId") as string | null;

    if (!file || !itemId) {
      return NextResponse.json(
        { error: "Missing file or itemId" },
        { status: 400 }
      );
    }

    // Verify item ownership
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate unique key for MinIO
    const extension = file.name.split(".").pop() || "jpg";
    const minioKey = `${session.user.id}/${itemId}/${randomUUID()}.${extension}`;

    // Ensure bucket exists
    await ensureBucket();

    // Upload file to MinIO
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await minioClient.putObject(BUCKET_NAME, minioKey, buffer, buffer.length, {
      "Content-Type": file.type,
    });

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        itemId,
        minioKey,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({ photo });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
