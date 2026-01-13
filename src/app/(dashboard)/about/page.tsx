"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Camera, Bell, ClipboardList, Warehouse, Globe, Check } from "lucide-react";

export default function AboutPage() {
  const { t } = useLanguage();

  const features = [
    { icon: Camera, text: t("about.featureScanning") },
    { icon: Bell, text: t("about.featureExpiration") },
    { icon: ClipboardList, text: t("about.featureChecklist") },
    { icon: Warehouse, text: t("about.featureMultiStash") },
    { icon: Globe, text: t("about.featureMultiLang") },
  ];

  const techStack = [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "Prisma",
    "PostgreSQL",
    "Anthropic Claude AI",
    "MinIO (S3)",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("settings.about")}</h1>

      <div className="flex flex-col items-center text-center py-8">
        <div className="mb-4">
          <AnimatedLogo size={100} />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("about.title")}</h1>
        <p className="text-muted-foreground max-w-md">{t("about.description")}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {process.env.NEXT_PUBLIC_GIT_COMMIT && (
            <span className="font-mono">{process.env.NEXT_PUBLIC_GIT_COMMIT}</span>
          )}
          {process.env.NEXT_PUBLIC_BUILD_TIME && (
            <span className="ml-2">
              ({new Date(process.env.NEXT_PUBLIC_BUILD_TIME).toLocaleDateString()})
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("about.whatIs")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.whatIsDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("about.features")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("about.techStack")}</CardTitle>
            <CardDescription>{t("about.builtWith")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm"
                >
                  <Check className="h-3 w-3 text-primary" />
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
