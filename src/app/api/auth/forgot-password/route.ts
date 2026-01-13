import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { passwordResetEmail } from "@/lib/emails";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, language = "en" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new token (expires in 1 hour)
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send email
    try {
      const emailContent = passwordResetEmail({
        userName: user.name || user.email || "User",
        resetToken: token,
        expiresAt,
        language: language as "da" | "en",
      });

      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email!,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Still return success - don't leak info about email sending
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
