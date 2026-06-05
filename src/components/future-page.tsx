"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ImagePlus, MapPinned, Plus, Save, Soup, Sparkle, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useMemoryData } from "@/hooks/use-memory-data";
import type { WishItem } from "@/types/memory";
import { fileBaseName } from "@/lib/file";
import { saveImageFile } from "@/lib/image-upload";
import { createId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MemoryImage } from "@/components/memory-image";

const categoryConfig: Record<
  WishItem["category"],
  { title: string; icon: React.ReactNode; tone: string }
> = {
  place: { title: "想去的地方", icon: <MapPinned className="size-4" />, tone: "地点" },
  food: { title: "想吃的店", icon: <Soup className="size-4" />, tone: "美食" },
  activity: { title: "想做的事", icon: <Sparkle className="size-4" />, tone: "体验" }
};

const emptyDraft = {
  title: "",
  description: "",
  imageUrl: ""
};

export function FuturePage() {
  const { data, actions } = useMemoryData();
  const [addingCategory, setAddingCategory] = useState<WishItem["category"] | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const groups = (["place", "food", "activity"] as const).map((category) => ({
    category,
    items: data.wishes.filter((item) => item.category === category)
  }));

  function toggleStatus(item: WishItem) {
    const done = item.status === "done";
    actions.upsert("wishes", {
      ...item,
      status: done ? "todo" : "done",
      targetDate: done ? undefined : new Date().toISOString().slice(0, 10)
    });
  }

  function openAdd(category: WishItem["category"]) {
    setAddingCategory(category);
    setDraft(emptyDraft);
  }

  function closeAdd() {
    setAddingCategory(null);
    setDraft(emptyDraft);
  }

  function submitAdd(event: FormEvent) {
    event.preventDefault();
    if (!addingCategory || !draft.title.trim()) {
      return;
    }
    actions.upsert("wishes", {
      id: createId("wish"),
      title: draft.title.trim(),
      category: addingCategory,
      description: draft.description.trim(),
      status: "todo",
      imageUrl: draft.imageUrl || undefined
    });
    closeAdd();
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const imageUrl = await saveImageFile(file);
    setDraft((current) => ({
      ...current,
      imageUrl,
      title: current.title || fileBaseName(file) || "新的计划"
    }));
  }

  return (
    <section className="container grid gap-5 pb-12 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group.category}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                {categoryConfig[group.category].icon}
              </div>
              <h2 className="font-semibold">{categoryConfig[group.category].title}</h2>
            </div>
            <Button size="sm" variant="outline" onClick={() => openAdd(group.category)}>
              <Plus /> 添加
            </Button>
          </div>
          <div className="space-y-4">
            {group.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden">
                  {item.imageUrl ? (
                    <div className="relative aspect-[4/3]">
                      <MemoryImage src={item.imageUrl} alt={item.title} fill sizes="33vw" className="object-cover" />
                    </div>
                  ) : null}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button type="button" onClick={() => toggleStatus(item)}>
                          <Badge variant={item.status === "done" ? "warm" : "secondary"}>
                            {item.status === "done" ? "已完成" : "未完成"}
                          </Badge>
                        </button>
                        <h3 className="mt-3 font-semibold">{item.title}</h3>
                      </div>
                      <button
                        type="button"
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => toggleStatus(item)}
                        aria-label="切换完成状态"
                      >
                        {item.status === "done" ? (
                          <CheckCircle2 className="size-5 text-amber-700 dark:text-amber-300" />
                        ) : (
                          <Circle className="size-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                    {item.targetDate ? (
                      <p className="mt-3 text-xs text-muted-foreground">完成于 {item.targetDate}</p>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={Boolean(addingCategory)} onOpenChange={(open) => !open && closeAdd()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              添加{addingCategory ? categoryConfig[addingCategory].title : "计划"}
            </DialogTitle>
            <DialogDescription>
              可以直接从手机相册选择图片，也可以只填写文字。
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitAdd}>
            <label className="block space-y-2">
              <span className="text-sm font-medium">标题</span>
              <Input
                value={draft.title}
                placeholder="例如：去海边看日落"
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">描述</span>
              <Textarea
                value={draft.description}
                placeholder="写一点你们想完成它的理由"
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            {draft.imageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                <MemoryImage src={draft.imageUrl} alt={draft.title || "预览图片"} fill className="object-cover" />
              </div>
            ) : null}
            <Button asChild variant="outline" className="w-full">
              <label className="cursor-pointer">
                <ImagePlus /> 从相册选择图片
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageFile(event.target.files?.[0])}
                />
              </label>
            </Button>
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  <X /> 取消
                </Button>
              </DialogClose>
              <Button type="submit">
                <Save /> 保存
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
