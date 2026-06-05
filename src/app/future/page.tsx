import type { Metadata } from "next";
import { FuturePage } from "@/components/future-page";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "未来清单"
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Future"
        title="把想一起完成的事，先认真写下来。"
        description="记录想去的地方、想吃的店和想一起做的事，并标记已完成或未完成。"
      />
      <FuturePage />
    </>
  );
}
