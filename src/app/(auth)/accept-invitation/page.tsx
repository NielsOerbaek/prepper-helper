"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Users } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";

interface InvitationDetails {
  id: string;
  stashName: string;
  stashId: string;
  status: string;
  expiresAt: string;
  isExpired: boolean;
}

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("id");
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useLanguage();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    const handleUnauthenticated = async () => {
      // First fetch invitation preview to get the email
      try {
        const previewResponse = await fetch(`/api/invitations/${invitationId}?preview=true`);
        if (previewResponse.ok) {
          const preview = await previewResponse.json();
          const email = preview.email || "";
          // Redirect to login with email prefilled
          const callbackUrl = encodeURIComponent(`/accept-invitation?id=${invitationId}`);
          router.push(`/login?callbackUrl=${callbackUrl}&email=${encodeURIComponent(email)}`);
          return;
        }
      } catch {
        // Fallback to login without email
      }
      router.push(`/login?callbackUrl=${encodeURIComponent(`/accept-invitation?id=${invitationId}`)}`);
    };

    if (sessionStatus === "unauthenticated") {
      handleUnauthenticated();
      return;
    }

    if (sessionStatus === "authenticated" && invitationId) {
      fetchInvitation();
    }
  }, [sessionStatus, invitationId, router]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`);
      const data = await response.json();

      if (!response.ok) {
        if (data.invitedEmail) {
          setInvitedEmail(data.invitedEmail);
        }
        setError(data.error || "Failed to load invitation");
        return;
      }

      setInvitation(data);
    } catch {
      setError("Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "accept" | "decline") => {
    if (!invitationId) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to process invitation");
        return;
      }

      setSuccess(action === "accept" ? "accepted" : "declined");

      if (action === "accept") {
        // Redirect to the stash after a short delay
        setTimeout(() => router.push("/"), 2000);
      }
    } catch {
      setError("Failed to process invitation");
    } finally {
      setProcessing(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invitationId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>{t("auth.invalidToken")}</CardTitle>
            <CardDescription>No invitation ID provided.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">{t("nav.dashboard")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    const isForbidden = error === "Forbidden" && invitedEmail;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>{isForbidden ? t("stash.wrongAccount") : t("common.error")}</CardTitle>
            <CardDescription>
              {isForbidden ? (
                <>
                  {t("stash.invitationForEmail")}{" "}
                  <span className="font-semibold text-foreground">{invitedEmail}</span>
                  <br />
                  <span className="text-sm mt-2 block">
                    {t("stash.loggedInAs")} {session?.user?.email}
                  </span>
                </>
              ) : (
                error
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">{t("nav.dashboard")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>
              {success === "accepted" ? t("stash.invitationAccepted") : t("stash.invitationDeclined")}
            </CardTitle>
            {success === "accepted" && (
              <CardDescription>Redirecting to dashboard...</CardDescription>
            )}
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">{t("nav.dashboard")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (invitation?.isExpired || invitation?.status !== "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>
              {invitation?.isExpired ? "Invitation Expired" : "Invitation No Longer Valid"}
            </CardTitle>
            <CardDescription>
              This invitation is no longer available.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">{t("nav.dashboard")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/icon.png"
              alt={t("app.name")}
              width={64}
              height={64}
              className="rounded-xl shadow-lg"
            />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            {t("stash.invitedTo")}
          </CardTitle>
          <CardDescription className="text-lg font-semibold text-foreground">
            {invitation?.stashName}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            {t("stash.expiresAt")}: {invitation && new Date(invitation.expiresAt).toLocaleDateString()}
          </p>
        </CardContent>
        <CardFooter className="flex gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAction("decline")}
            disabled={processing}
          >
            {t("common.decline")}
          </Button>
          <Button
            type="button"
            onClick={() => handleAction("accept")}
            disabled={processing}
          >
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("common.accept")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
