import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TimelinePage } from "@/components/timeline-page";

export const metadata: Metadata = {
  title: "时间线"
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Timeline"
        title="按时间，把重要与普通都收好。"
        description="第一次见面、第一次约会、旅行、礼物和那些看似日常却被记住的小事。"
      />
      <TimelinePage />
    </>
  );
}
