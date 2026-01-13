import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { analyzeImages } from "@/lib/anthropic";
import { Category, Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  console.log("[AI Analyze] Received POST request");

  try {
    const session = await getServerSession(authOptions);
    console.log("[AI Analyze] Session:", session?.user?.id ? "authenticated" : "not authenticated");

    if (!session?.user?.id) {
      console.log("[AI Analyze] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[AI Analyze] Request body keys:", Object.keys(body));
    console.log("[AI Analyze] imageBase64 length:", body.imageBase64?.length || 0);
    console.log("[AI Analyze] mimeType:", body.mimeType);
    console.log("[AI Analyze] expirationImageBase64 length:", body.expirationImageBase64?.length || 0);
    console.log("[AI Analyze] expirationMimeType:", body.expirationMimeType);

    const { photoId, imageBase64, mimeType, expirationImageBase64, expirationMimeType } = body;

    if (!imageBase64 || !mimeType) {
      console.log("[AI Analyze] Missing required fields - imageBase64:", !!imageBase64, "mimeType:", !!mimeType);
      return NextResponse.json(
        { error: "Image data and mime type are required" },
        { status: 400 }
      );
    }

    console.log("[AI Analyze] Calling analyzeImages...");
    // Analyze the images (front image required, expiration image optional)
    const analysis = await analyzeImages(
      { base64: imageBase64, mimeType },
      expirationImageBase64 && expirationMimeType
        ? { base64: expirationImageBase64, mimeType: expirationMimeType }
        : undefined
    );
    console.log("[AI Analyze] Analysis result:", analysis);

    // If photoId is provided, update the photo record
    if (photoId) {
      const photo = await prisma.photo.findUnique({
        where: { id: photoId },
        include: { item: true },
      });

      if (photo && photo.item.userId === session.user.id) {
        await prisma.photo.update({
          where: { id: photoId },
          data: { aiAnalysis: analysis as unknown as Prisma.InputJsonValue },
        });

        // Optionally update the item with AI-extracted data
        const updateData: Record<string, unknown> = {
          aiExtracted: true,
        };

        if (analysis.name && !photo.item.name) {
          updateData.name = analysis.name;
        }
        if (analysis.description && !photo.item.description) {
          updateData.description = analysis.description;
        }
        if (analysis.expirationDate && !photo.item.expirationDate) {
          updateData.expirationDate = new Date(analysis.expirationDate);
        }
        if (analysis.category && photo.item.category === "OTHER") {
          const category = analysis.category.toUpperCase() as Category;
          if (Object.values(Category).includes(category)) {
            updateData.category = category;
          }
        }

        await prisma.item.update({
          where: { id: photo.itemId },
          data: updateData,
        });
      }
    }

    console.log("[AI Analyze] Returning successful response");
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[AI Analyze] Error:", error);
    console.error("[AI Analyze] Error name:", (error as Error)?.name);
    console.error("[AI Analyze] Error message:", (error as Error)?.message);
    console.error("[AI Analyze] Error stack:", (error as Error)?.stack);
    return NextResponse.json(
      { error: "Failed to analyze image", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
