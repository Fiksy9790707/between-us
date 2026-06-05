"use client";

import Image from "next/image";
import { Edit3, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useMemoryData, type CollectionKey } from "@/hooks/use-memory-data";
import type { MemoryData, Tag } from "@/types/memory";
import { tagOptions } from "@/lib/constants";
import { createId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "date" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
};

const entityConfig: Record<
  CollectionKey,
  { label: string; prefix: string; fields: FieldConfig[] }
> = {
  timeline: {
    label: "时间线",
    prefix: "tl",
    fields: [
      { name: "date", label: "日期", type: "date" },
      { name: "title", label: "标题" },
      { name: "description", label: "描述", type: "textarea" },
      { name: "imageUrl", label: "图片 URL" },
      { name: "location", label: "地点" },
      { name: "tags", label: "标签", placeholder: "first,date,daily" }
    ]
  },
  photos: {
    label: "照片",
    prefix: "ph",
    fields: [
      { name: "date", label: "日期", type: "date" },
      { name: "title", label: "标题" },
      { name: "alt", label: "图片描述" },
      { name: "imageUrl", label: "图片 URL" },
      { name: "location", label: "地点" },
      { name: "tags", label: "标签", placeholder: "travel,date" }
    ]
  },
  anniversaries: {
    label: "纪念日",
    prefix: "ann",
    fields: [
      { name: "title", label: "标题" },
      { name: "date", label: "日期", type: "date" },
      {
        name: "type",
        label: "类型",
        type: "select",
        options: [
          { label: "纪念日", value: "anniversary" },
          { label: "生日", value: "birthday" },
          { label: "重要日期", value: "custom" }
        ]
      },
      {
        name: "recurring",
        label: "重复",
        type: "select",
        options: [
          { label: "每年", value: "yearly" },
          { label: "不重复", value: "none" }
        ]
      },
      { name: "person", label: "关联人物" }
    ]
  },
  gifts: {
    label: "礼物",
    prefix: "gift",
    fields: [
      { name: "date", label: "日期", type: "date" },
      { name: "title", label: "礼物名称" },
      { name: "scenario", label: "场景" },
      { name: "price", label: "价格", type: "number" },
      { name: "reaction", label: "她的反应", type: "textarea" },
      { name: "imageUrl", label: "图片 URL" },
      { name: "tags", label: "标签", placeholder: "gift,daily" }
    ]
  },
  wishes: {
    label: "未来清单",
    prefix: "wish",
    fields: [
      { name: "title", label: "标题" },
      {
        name: "category",
        label: "类别",
        type: "select",
        options: [
          { label: "想去的地方", value: "place" },
          { label: "想吃的店", value: "food" },
          { label: "想做的事", value: "activity" }
        ]
      },
      {
        name: "status",
        label: "状态",
        type: "select",
        options: [
          { label: "未完成", value: "todo" },
          { label: "已完成", value: "done" }
        ]
      },
      { name: "description", label: "描述", type: "textarea" },
      { name: "targetDate", label: "完成日期", type: "date" },
      { name: "imageUrl", label: "图片 URL" }
    ]
  }
};

const emptyDraft: Record<CollectionKey, Record<string, string>> = {
  timeline: {
    date: "",
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    tags: "daily"
  },
  photos: {
    date: "",
    title: "",
    alt: "",
    imageUrl: "",
    location: "",
    tags: "daily"
  },
  anniversaries: {
    title: "",
    date: "",
    type: "custom",
    recurring: "yearly",
    person: ""
  },
  gifts: {
    date: "",
    title: "",
    scenario: "",
    price: "",
    reaction: "",
    imageUrl: "",
    tags: "gift"
  },
  wishes: {
    title: "",
    category: "activity",
    status: "todo",
    description: "",
    targetDate: "",
    imageUrl: ""
  }
};

export function AdminDashboard() {
  const { data, actions } = useMemoryData();
  const [active, setActive] = useState<CollectionKey>("timeline");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>(emptyDraft.timeline);

  const collection = useMemo(() => {
    return data[active] as Array<Record<string, unknown> & { id: string; title: string }>;
  }, [active, data]);

  function startCreate(key = active) {
    setEditingId(null);
    setDraft(emptyDraft[key]);
  }

  function startEdit(item: Record<string, unknown> & { id: string }) {
    setEditingId(item.id);
    const next: Record<string, string> = {};
    entityConfig[active].fields.forEach((field) => {
      const value = item[field.name];
      next[field.name] = Array.isArray(value) ? value.join(",") : String(value ?? "");
    });
    setDraft(next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = normalizePayload(active, draft, editingId);
    actions.upsert(active, payload);
    startCreate(active);
  }

  function handleTabChange(value: string) {
    const key = value as CollectionKey;
    setActive(key);
    setEditingId(null);
    setDraft(emptyDraft[key]);
  }

  return (
    <section className="container pb-12">
      <div className="mb-5 rounded-lg border bg-accent/60 p-4 text-sm leading-6 text-accent-foreground">
        当前数据保存在浏览器 localStorage。部署到 Vercel 后无需数据库即可使用；未来迁移时可把
        <code className="mx-1 rounded bg-background px-1.5 py-0.5">useMemoryData</code>
        替换为 Supabase/PostgreSQL 的数据访问层。
      </div>

      <Tabs value={active} defaultValue="timeline" onValueChange={handleTabChange}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-max">
            {(Object.keys(entityConfig) as CollectionKey[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {entityConfig[key].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {(Object.keys(entityConfig) as CollectionKey[]).map((key) => (
          <TabsContent key={key} value={key}>
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>{editingId ? "编辑记录" : "新增记录"}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => startCreate(key)}>
                    <Plus /> 新建
                  </Button>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {entityConfig[key].fields.map((field) => (
                      <Field
                        key={field.name}
                        field={field}
                        value={draft[field.name] ?? ""}
                        onChange={(value) => setDraft((current) => ({ ...current, [field.name]: value }))}
                      />
                    ))}
                    {hasTags(key) ? (
                      <p className="text-xs text-muted-foreground">
                        可用标签：
                        {tagOptions.map((item) => `${item.value}=${item.label}`).join(" · ")}
                      </p>
                    ) : null}
                    <div className="flex gap-2">
                      <Button type="submit">
                        <Save /> 保存
                      </Button>
                      {editingId ? (
                        <Button type="button" variant="outline" onClick={() => startCreate(key)}>
                          <X /> 取消
                        </Button>
                      ) : null}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>{entityConfig[key].label}列表</CardTitle>
                  <Button variant="outline" size="sm" onClick={actions.reset}>
                    <RotateCcw /> 重置示例
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {collection.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[72px_1fr_auto]"
                    >
                      <PreviewImage item={item} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {String(item.date ?? item.category ?? item.type ?? "")}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {String(item.description ?? item.reaction ?? item.scenario ?? "")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Button variant="outline" size="icon" title="编辑" onClick={() => startEdit(item)}>
                          <Edit3 />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          title="删除"
                          onClick={() => actions.remove(key, item.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function Field({
  field,
  value,
  onChange
}: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{field.label}</span>
      {field.type === "textarea" ? (
        <Textarea
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type ?? "text"}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function PreviewImage({ item }: { item: Record<string, unknown> }) {
  const imageUrl = typeof item.imageUrl === "string" ? item.imageUrl : "";
  if (!imageUrl) {
    return <div className="hidden size-[72px] rounded-md bg-muted sm:block" />;
  }
  return (
    <div className="relative hidden size-[72px] overflow-hidden rounded-md bg-muted sm:block">
      <Image src={imageUrl} alt={String(item.title ?? "")} fill sizes="72px" className="object-cover" />
    </div>
  );
}

function normalizePayload(
  key: CollectionKey,
  draft: Record<string, string>,
  editingId: string | null
): MemoryData[CollectionKey][number] {
  const id = editingId ?? createId(entityConfig[key].prefix);

  if (key === "anniversaries") {
    return {
      id,
      title: draft.title,
      date: draft.date,
      type: draft.type as "anniversary" | "birthday" | "custom",
      recurring: draft.recurring as "none" | "yearly",
      person: draft.person || undefined
    };
  }

  if (key === "wishes") {
    return {
      id,
      title: draft.title,
      category: draft.category as "place" | "food" | "activity",
      description: draft.description,
      status: draft.status as "todo" | "done",
      targetDate: draft.targetDate || undefined,
      imageUrl: draft.imageUrl || undefined
    };
  }

  if (key === "gifts") {
    return {
      id,
      title: draft.title,
      date: draft.date,
      scenario: draft.scenario,
      price: draft.price ? Number(draft.price) : undefined,
      reaction: draft.reaction,
      imageUrl: draft.imageUrl,
      tags: parseTags(draft.tags)
    };
  }

  if (key === "photos") {
    return {
      id,
      title: draft.title,
      date: draft.date,
      alt: draft.alt,
      imageUrl: draft.imageUrl,
      location: draft.location,
      tags: parseTags(draft.tags)
    };
  }

  return {
    id,
    title: draft.title,
    date: draft.date,
    description: draft.description,
    imageUrl: draft.imageUrl,
    location: draft.location,
    tags: parseTags(draft.tags)
  };
}

function parseTags(value: string): Tag[] {
  const allowed = new Set(tagOptions.map((item) => item.value));
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag): tag is Tag => allowed.has(tag as Tag));
  return tags.length ? tags : ["daily"];
}

function hasTags(key: CollectionKey) {
  return key === "timeline" || key === "photos" || key === "gifts";
}
