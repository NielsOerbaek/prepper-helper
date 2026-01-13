import { Category } from "@prisma/client";

export type { Category };

export interface ItemWithPhotos {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: Category;
  quantity: number;
  expirationDate: Date | null;
  aiExtracted: boolean;
  createdAt: Date;
  updatedAt: Date;
  photos: Photo[];
}

export interface Photo {
  id: string;
  itemId: string;
  minioKey: string;
  originalName: string | null;
  mimeType: string;
  size: number;
  aiAnalysis: Record<string, unknown> | null;
  createdAt: Date;
}

export interface CreateItemInput {
  name: string;
  description?: string;
  category?: Category;
  quantity?: number;
  expirationDate?: string;
}

export interface UpdateItemInput extends Partial<CreateItemInput> {
  id: string;
}

export interface UploadPhotoInput {
  itemId: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export type ExpirationStatus = "safe" | "warning" | "danger" | "expired";

export function getExpirationStatus(expirationDate: Date | null): ExpirationStatus {
  if (!expirationDate) return "safe";

  const now = new Date();
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) return "expired";
  if (daysUntilExpiration <= 3) return "danger";
  if (daysUntilExpiration <= 7) return "warning";
  return "safe";
}

export const CATEGORY_LABELS: Record<Category, string> = {
  WATER: "Water",
  CANNED_FOOD: "Canned Food",
  DRY_GOODS: "Dry Goods",
  FIRST_AID: "First Aid",
  TOOLS: "Tools",
  HYGIENE: "Hygiene",
  DOCUMENTS: "Documents",
  OTHER: "Other",
};

// Default checklist items use translation keys (prefixed with "checklist.item.")
// The UI translates these based on the user's language
export const DEFAULT_CHECKLIST_ITEMS: Array<{ name: string; category: Category }> = [
  { name: "checklist.item.bottledWater", category: "WATER" },
  { name: "checklist.item.waterPurification", category: "WATER" },
  { name: "checklist.item.cannedVegetables", category: "CANNED_FOOD" },
  { name: "checklist.item.cannedFruits", category: "CANNED_FOOD" },
  { name: "checklist.item.cannedMeatFish", category: "CANNED_FOOD" },
  { name: "checklist.item.cannedSoup", category: "CANNED_FOOD" },
  { name: "checklist.item.rice", category: "DRY_GOODS" },
  { name: "checklist.item.pasta", category: "DRY_GOODS" },
  { name: "checklist.item.oatmeal", category: "DRY_GOODS" },
  { name: "checklist.item.crackers", category: "DRY_GOODS" },
  { name: "checklist.item.peanutButter", category: "DRY_GOODS" },
  { name: "checklist.item.driedBeans", category: "DRY_GOODS" },
  { name: "checklist.item.firstAidKit", category: "FIRST_AID" },
  { name: "checklist.item.prescriptionMeds", category: "FIRST_AID" },
  { name: "checklist.item.painRelievers", category: "FIRST_AID" },
  { name: "checklist.item.bandagesGauze", category: "FIRST_AID" },
  { name: "checklist.item.antisepticWipes", category: "FIRST_AID" },
  { name: "checklist.item.flashlight", category: "TOOLS" },
  { name: "checklist.item.batteries", category: "TOOLS" },
  { name: "checklist.item.canOpener", category: "TOOLS" },
  { name: "checklist.item.multitool", category: "TOOLS" },
  { name: "checklist.item.radio", category: "TOOLS" },
  { name: "checklist.item.toiletPaper", category: "HYGIENE" },
  { name: "checklist.item.handSanitizer", category: "HYGIENE" },
  { name: "checklist.item.soap", category: "HYGIENE" },
  { name: "checklist.item.toothbrushPaste", category: "HYGIENE" },
  { name: "checklist.item.importantDocs", category: "DOCUMENTS" },
  { name: "checklist.item.cash", category: "DOCUMENTS" },
];
