"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStash, Stash } from "@/lib/stash-context";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export function StashSwitcher() {
  const { currentStash, stashes, setCurrentStash, createStash, isLoading } = useStash();
  const { t } = useLanguage();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newStashName, setNewStashName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStash = async () => {
    if (!newStashName.trim()) return;

    setIsCreating(true);
    const stash = await createStash(newStashName.trim());
    setIsCreating(false);

    if (stash) {
      setNewStashName("");
      setIsCreateOpen(false);
    }
  };

  const handleStashSelect = (stash: Stash) => {
    setCurrentStash(stash);
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" className="w-[180px] justify-between" disabled>
        <span className="truncate">{t("stash.loading")}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (!currentStash) {
    return (
      <Button variant="outline" size="sm" className="w-[180px] justify-between" disabled>
        <span className="truncate text-muted-foreground">{t("stash.noStash")}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-[180px] justify-between">
            <span className="truncate">{currentStash.name}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel>{t("stash.selectStash")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {stashes.map((stash) => (
            <DropdownMenuItem
              key={stash.id}
              onClick={() => handleStashSelect(stash)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  currentStash.id === stash.id ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="truncate">{stash.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {stash.memberCount}
                  {stash.role !== "MEMBER" && (
                    <span className="ml-1">({t(`stash.role.${stash.role.toLowerCase()}`)})</span>
                  )}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCreateOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("stash.createStash")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/stash")}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            {t("stash.manageStash")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("stash.createStash")}</DialogTitle>
            <DialogDescription>
              {t("stash.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stash-name">{t("stash.name")}</Label>
              <Input
                id="stash-name"
                value={newStashName}
                onChange={(e) => setNewStashName(e.target.value)}
                placeholder={t("stash.namePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateStash();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateStash}
              disabled={!newStashName.trim() || isCreating}
            >
              {isCreating ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
