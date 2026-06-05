import type { Metadata } from "next";
import { GiftsPage } from "@/components/gifts-page";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "礼物记录"
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Gifts"
        title="礼物是被看见的证据，不只是物品。"
        description="记录送过的礼物、场景、价格、她的反应和照片，保留每一次用心。"
      />
      <GiftsPage />
    </>
  );
}
