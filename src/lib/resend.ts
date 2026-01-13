import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const APP_URL = process.env.NEXTAUTH_URL || "https://prep.raakode.dk";
export const FROM_EMAIL = "Prepperhjælper <noreply@raakode.dk>";
