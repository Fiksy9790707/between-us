import type { Metadata } from "next";
import { AnniversariesPage } from "@/components/anniversaries-page";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "纪念日"
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Dates"
        title="重要日子不需要提醒很多次，只需要不被忘记。"
        description="自动计算恋爱天数、下一个纪念日倒计时、生日倒计时和重要日期列表。"
      />
      <AnniversariesPage />
    </>
  );
}
