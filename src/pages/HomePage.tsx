import React from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/template/Footer";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-[calc(100%-40px)] flex-col pb-2">
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <span>
          <h1 className="font-mono text-4xl font-bold">{t("appName")}</h1>
        </span>
      </div>
      <Footer />
    </div>
  );
}
