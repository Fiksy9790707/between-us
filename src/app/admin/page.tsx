import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "管理后台"
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="用一个安静的后台，管理所有回忆。"
        description="新增、编辑、删除时间线事件、照片、纪念日、礼物和未来清单。"
      />
      <AdminDashboard />
    </>
  );
}
