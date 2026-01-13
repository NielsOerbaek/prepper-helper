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

export const DEFAULT_CHECKLIST_ITEMS: Array<{ name: string; category: Category }> = [
  { name: "Bottled Water (1 gallon per person per day)", category: "WATER" },
  { name: "Water Purification Tablets", category: "WATER" },
  { name: "Canned Vegetables", category: "CANNED_FOOD" },
  { name: "Canned Fruits", category: "CANNED_FOOD" },
  { name: "Canned Meat/Fish", category: "CANNED_FOOD" },
  { name: "Canned Soup", category: "CANNED_FOOD" },
  { name: "Rice", category: "DRY_GOODS" },
  { name: "Pasta", category: "DRY_GOODS" },
  { name: "Oatmeal", category: "DRY_GOODS" },
  { name: "Crackers", category: "DRY_GOODS" },
  { name: "Peanut Butter", category: "DRY_GOODS" },
  { name: "Dried Beans/Lentils", category: "DRY_GOODS" },
  { name: "First Aid Kit", category: "FIRST_AID" },
  { name: "Prescription Medications", category: "FIRST_AID" },
  { name: "Pain Relievers", category: "FIRST_AID" },
  { name: "Bandages and Gauze", category: "FIRST_AID" },
  { name: "Antiseptic Wipes", category: "FIRST_AID" },
  { name: "Flashlight", category: "TOOLS" },
  { name: "Batteries", category: "TOOLS" },
  { name: "Manual Can Opener", category: "TOOLS" },
  { name: "Multi-tool/Knife", category: "TOOLS" },
  { name: "Radio (battery or hand-crank)", category: "TOOLS" },
  { name: "Toilet Paper", category: "HYGIENE" },
  { name: "Hand Sanitizer", category: "HYGIENE" },
  { name: "Soap", category: "HYGIENE" },
  { name: "Toothbrush and Toothpaste", category: "HYGIENE" },
  { name: "Important Documents (copies)", category: "DOCUMENTS" },
  { name: "Cash (small bills)", category: "DOCUMENTS" },
];
