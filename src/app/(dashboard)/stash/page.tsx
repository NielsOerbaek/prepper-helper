"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStash } from "@/lib/stash-context";
import { useLanguage } from "@/lib/language-context";
import { getRoleKey } from "@/lib/translations";
import { toast } from "sonner";
import { Loader2, Users, Mail, Trash2, MoreVertical, UserMinus, Shield, Check, X, Edit2 } from "lucide-react";

interface Member {
  userId: string;
  name: string | null;
  email: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string | null;
  userId: string | null;
  createdAt: string;
  expiresAt: string;
}

interface StashDetails {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  members: Member[];
  pendingInvitations: Invitation[];
  itemCount: number;
  checklistCount: number;
}

interface UserInvitation {
  id: string;
  stashId: string;
  stashName: string;
  createdAt: string;
  expiresAt: string;
}

export default function StashPage() {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const { currentStash, refreshStashes, setCurrentStash, stashes } = useStash();
  const [stashDetails, setStashDetails] = useState<StashDetails | null>(null);
  const [userInvitations, setUserInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "stash" | "member" | "leave"; id?: string } | null>(null);

  const fetchStashDetails = useCallback(async () => {
    if (!currentStash) {
      setStashDetails(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/stashes/${currentStash.id}`);
      if (!response.ok) throw new Error("Failed to fetch stash details");
      const data = await response.json();
      setStashDetails(data);
      setNewName(data.name);
    } catch (error) {
      console.error("Failed to fetch stash details:", error);
      toast.error(t("toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [currentStash, t]);

  const fetchUserInvitations = useCallback(async () => {
    try {
      const response = await fetch("/api/invitations");
      if (!response.ok) throw new Error("Failed to fetch invitations");
      const data = await response.json();
      setUserInvitations(data);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    }
  }, []);

  useEffect(() => {
    fetchStashDetails();
    fetchUserInvitations();
  }, [fetchStashDetails, fetchUserInvitations]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentStash) return;

    setIsInviting(true);
    try {
      const response = await fetch(`/api/stashes/${currentStash.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), language }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invitation");
      }

      toast.success(t("stash.invitationSent"));
      setInviteEmail("");
      setShowInviteDialog(false);
      fetchStashDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.saveFailed"));
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!currentStash) return;

    try {
      const response = await fetch(
        `/api/stashes/${currentStash.id}/invitations?invitationId=${invitationId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to cancel invitation");

      toast.success(t("stash.invitationCanceled"));
      fetchStashDetails();
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRemoveMember = async () => {
    if (!currentStash || deleteConfirm?.type !== "member" || !deleteConfirm.id) return;

    try {
      const response = await fetch(
        `/api/stashes/${currentStash.id}/members/${deleteConfirm.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to remove member");

      toast.success(t("stash.memberRemoved"));
      fetchStashDetails();
    } catch {
      toast.error(t("toast.deleteFailed"));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleLeaveStash = async () => {
    if (!currentStash || !session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/stashes/${currentStash.id}/members/${session.user.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to leave stash");
      }

      toast.success(t("stash.leftStash"));
      await refreshStashes();
      // Select another stash
      const otherStash = stashes.find((s) => s.id !== currentStash.id);
      if (otherStash) {
        setCurrentStash(otherStash);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.deleteFailed"));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDeleteStash = async () => {
    if (!currentStash) return;

    try {
      const response = await fetch(`/api/stashes/${currentStash.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete stash");
      }

      toast.success(t("stash.stashDeleted"));
      await refreshStashes();
      // Select another stash
      const otherStash = stashes.find((s) => s.id !== currentStash.id);
      if (otherStash) {
        setCurrentStash(otherStash);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.deleteFailed"));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSaveName = async () => {
    if (!currentStash || !newName.trim()) return;

    setIsSavingName(true);
    try {
      const response = await fetch(`/api/stashes/${currentStash.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update name");

      toast.success(t("stash.stashUpdated"));
      setIsEditingName(false);
      fetchStashDetails();
      refreshStashes();
    } catch {
      toast.error(t("toast.updateFailed"));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      if (!response.ok) throw new Error("Failed to accept invitation");

      const data = await response.json();
      toast.success(t("stash.invitationAccepted"));
      await refreshStashes();
      fetchUserInvitations();

      // Switch to the new stash
      const newStash = stashes.find((s) => s.id === data.stashId);
      if (newStash) {
        setCurrentStash(newStash);
      }
    } catch {
      toast.error(t("toast.updateFailed"));
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });

      if (!response.ok) throw new Error("Failed to decline invitation");

      toast.success(t("stash.invitationDeclined"));
      fetchUserInvitations();
    } catch {
      toast.error(t("toast.updateFailed"));
    }
  };

  const canInvite = stashDetails?.role === "OWNER" || stashDetails?.role === "ADMIN";
  const canEdit = stashDetails?.role === "OWNER" || stashDetails?.role === "ADMIN";
  const isOwner = stashDetails?.role === "OWNER";

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("stash.settings")}</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!currentStash || !stashDetails) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("stash.settings")}</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("stash.noStash")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("stash.settings")}</h1>
          <p className="text-muted-foreground">{t("stash.settingsDescription")}</p>
        </div>
      </div>

      {/* User's pending invitations */}
      {userInvitations.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("stash.yourInvitations")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{invitation.stashName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("stash.expiresAt")}: {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptInvitation(invitation.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    {t("common.accept")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeclineInvitation(invitation.id)}>
                    <X className="h-4 w-4 mr-1" />
                    {t("common.decline")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stash info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-48"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={isSavingName}>
                    {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardTitle>{stashDetails.name}</CardTitle>
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
            <Badge variant="secondary">{t(getRoleKey(stashDetails.role))}</Badge>
          </div>
          <CardDescription>
            {stashDetails.itemCount} {t("stash.itemCount")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOwner && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setDeleteConfirm({ type: "leave" })}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              {t("stash.leave")}
            </Button>
          )}
          {isOwner && stashes.length > 1 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteConfirm({ type: "stash" })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("stash.delete")}
            </Button>
          )}
          {isOwner && stashes.length === 1 && (
            <p className="text-sm text-muted-foreground">{t("stash.cannotDeleteOnly")}</p>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("stash.members")}
              </CardTitle>
              <CardDescription>
                {stashDetails.members.length} {stashDetails.members.length === 1 ? "member" : "members"}
              </CardDescription>
            </div>
            {canInvite && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <Mail className="h-4 w-4 mr-2" />
                {t("stash.invite")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {stashDetails.members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  {member.name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium">
                    {member.name || member.email || "Unknown"}
                    {member.userId === session?.user?.id && (
                      <span className="text-muted-foreground ml-1">{t("stash.you")}</span>
                    )}
                  </p>
                  {member.email && member.name && (
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                  {t(getRoleKey(member.role))}
                </Badge>
                {isOwner && member.userId !== session?.user?.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirm({ type: "member", id: member.userId })}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        {t("stash.removeMember")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending invitations */}
      {canInvite && stashDetails.pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("stash.pendingInvitations")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stashDetails.pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{invitation.email || invitation.userId}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("stash.expiresAt")}: {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleCancelInvitation(invitation.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invite dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("stash.inviteByEmail")}</DialogTitle>
            <DialogDescription>{t("stash.inviteDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t("stash.emailPlaceholder")}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}>
              {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("common.invite")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={deleteConfirm?.type === "stash"}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={t("stash.delete")}
        description={t("stash.deleteConfirm")}
        onConfirm={handleDeleteStash}
        confirmText={t("confirm.delete")}
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteConfirm?.type === "member"}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={t("stash.removeMember")}
        description={t("stash.removeMemberConfirm")}
        onConfirm={handleRemoveMember}
        confirmText={t("confirm.delete")}
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteConfirm?.type === "leave"}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={t("stash.leave")}
        description={t("stash.leaveConfirm")}
        onConfirm={handleLeaveStash}
        confirmText={t("common.leave")}
        variant="destructive"
      />
    </div>
  );
}
