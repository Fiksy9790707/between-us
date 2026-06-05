import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PhotosPage } from "@/components/photos-page";

export const metadata: Metadata = {
  title: "照片墙"
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="照片不用太多，但每张都应该能回到那一刻。"
        description="瀑布流照片墙，点击查看大图，适合存放旅行、约会和日常片段。"
      />
      <PhotosPage />
    </>
  );
}
