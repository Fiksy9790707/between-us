"use client";

import {
  Edit3,
  ImagePlus,
  Images,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X
} from "lucide-react";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useState
} from "react";
import { useMemoryData, type CollectionKey } from "@/hooks/use-memory-data";
import type { MemoryData, Photo, Profile, Tag } from "@/types/memory";
import { saveImageFile } from "@/lib/image-upload";
import { defaultTags, isChineseTag, uniqueTags } from "@/lib/constants";
import { createId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MemoryImage } from "@/components/memory-image";

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "date" | "number" | "textarea" | "select" | "tags";
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
      { name: "tags", label: "标签", type: "tags" }
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
      { name: "tags", label: "标签", type: "tags" }
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
      { name: "tags", label: "标签", type: "tags" }
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
    tags: "日常"
  },
  photos: {
    date: "",
    title: "",
    alt: "",
    imageUrl: "",
    location: "",
    tags: "日常"
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
    tags: "礼物"
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
  const { data, source, actions } = useMemoryData();
  const [active, setActive] = useState<CollectionKey>("timeline");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>(emptyDraft.timeline);
  const [editorOpen, setEditorOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const collection = useMemo(() => {
    return data[active] as Array<Record<string, unknown> & { id: string; title: string }>;
  }, [active, data]);

  const availableTags = useMemo(() => {
    return uniqueTags([
      ...defaultTags,
      ...data.timeline.flatMap((item) => item.tags),
      ...data.photos.flatMap((item) => item.tags),
      ...data.gifts.flatMap((item) => item.tags)
    ]);
  }, [data.gifts, data.photos, data.timeline]);

  function startCreate(key = active) {
    setActive(key);
    setEditingId(null);
    setDraft({ ...emptyDraft[key] });
    setEditorOpen(true);
  }

  function startEdit(item: Record<string, unknown> & { id: string }) {
    setEditingId(item.id);
    const next: Record<string, string> = {};
    entityConfig[active].fields.forEach((field) => {
      const value = item[field.name];
      next[field.name] = Array.isArray(value) ? value.join(",") : String(value ?? "");
    });
    setDraft(next);
    setEditorOpen(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = normalizePayload(active, draft, editingId);
    actions.upsert(active, payload);
    closeEditor();
  }

  function handleBulkImport(photos: Photo[]) {
    actions.upsertMany("photos", photos);
    setBulkOpen(false);
  }

  function closeEditor() {
    setEditingId(null);
    setDraft({ ...emptyDraft[active] });
    setEditorOpen(false);
  }

  function handleTabChange(value: string) {
    const key = value as CollectionKey;
    setActive(key);
    setEditingId(null);
    setDraft({ ...emptyDraft[key] });
    setEditorOpen(false);
  }

  return (
    <section className="container space-y-5 pb-12">
      <ProfileSettings profile={data.profile} onSave={actions.updateProfile} />

      <div className="rounded-lg border bg-accent/60 p-4 text-sm leading-6 text-accent-foreground">
        当前模式：
        <strong className="mx-1">{source === "cloud" ? "Supabase 云端同步" : "本地备用模式"}</strong>
        。云端模式下，你和 Cindy 在不同设备上修改后都会写入同一份数据库；上传图片会保存到 Supabase Storage。
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
            <Card>
              <CardHeader className="flex flex-col items-start justify-between gap-3 space-y-0 sm:flex-row sm:items-center">
                <CardTitle>{entityConfig[key].label}列表</CardTitle>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("确定要清空所有示例内容吗？基础设置会保留。")) {
                        actions.clearAll();
                      }
                    }}
                  >
                    <Trash2 /> 清空内容
                  </Button>
                  <Button variant="outline" size="sm" onClick={actions.reset}>
                    <RotateCcw /> 恢复示例
                  </Button>
                  {key === "photos" ? (
                    <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
                      <Images /> 批量导入
                    </Button>
                  ) : null}
                  <Button size="sm" onClick={() => startCreate(key)}>
                    <Plus /> 新建
                  </Button>
                </div>
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
          </TabsContent>
        ))}
      </Tabs>

      <EntityEditorDialog
        active={active}
        availableTags={availableTags}
        draft={draft}
        editingId={editingId}
        open={editorOpen}
        onDraftChange={setDraft}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) {
            closeEditor();
          }
        }}
        onSubmit={handleSubmit}
      />
      <BulkPhotoDialog
        open={bulkOpen}
        onImport={handleBulkImport}
        onOpenChange={setBulkOpen}
      />
    </section>
  );
}

function EntityEditorDialog({
  active,
  availableTags,
  draft,
  editingId,
  open,
  onDraftChange,
  onOpenChange,
  onSubmit
}: {
  active: CollectionKey;
  availableTags: string[];
  draft: Record<string, string>;
  editingId: string | null;
  open: boolean;
  onDraftChange: Dispatch<SetStateAction<Record<string, string>>>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const config = entityConfig[active];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingId ? `编辑${config.label}` : `新增${config.label}`}</DialogTitle>
          <DialogDescription>
            在这里填写这条记录的内容，保存后会立即更新到当前页面。
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" || field.type === "tags" ? "md:col-span-2" : ""}>
                {field.type === "tags" ? (
                  <TagSelector
                    availableTags={availableTags}
                    value={draft[field.name] ?? ""}
                    onChange={(value) =>
                      onDraftChange((current) => ({ ...current, [field.name]: value }))
                    }
                  />
                ) : field.name === "imageUrl" ? (
                  <ImageValueField
                    value={draft[field.name] ?? ""}
                    onChange={(value) =>
                      onDraftChange((current) => ({ ...current, [field.name]: value }))
                    }
                  />
                ) : (
                  <Field
                    field={field}
                    value={draft[field.name] ?? ""}
                    onChange={(value) =>
                      onDraftChange((current) => ({ ...current, [field.name]: value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
          {active === "photos" ? (
            <p className="text-xs text-muted-foreground">
              单张新增适合精修记录；多张照片可以回到列表右上角使用批量导入。
            </p>
          ) : null}
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
  );
}

function TagSelector({
  availableTags,
  value,
  onChange
}: {
  availableTags: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [newTag, setNewTag] = useState("");
  const selectedTags = parseTags(value);
  const tags = uniqueTags([...availableTags, ...selectedTags]);
  const trimmedNewTag = newTag.trim();
  const canAdd = trimmedNewTag.length > 0 && isChineseTag(trimmedNewTag);

  function toggleTag(tag: string) {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];
    onChange(nextTags.join(","));
  }

  function addTag() {
    if (!canAdd) {
      return;
    }
    onChange(uniqueTags([...selectedTags, trimmedNewTag]).join(","));
    setNewTag("");
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">标签</span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className="h-8"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newTag}
          placeholder="新建中文标签，例如：周末"
          onChange={(event) => setNewTag(event.target.value)}
        />
        <Button type="button" variant="outline" onClick={addTag} disabled={!canAdd}>
          <Plus /> 添加标签
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        标签会保存为中文；至少包含一个中文字符才能新建。
      </p>
    </div>
  );
}

function BulkPhotoDialog({
  open,
  onImport,
  onOpenChange
}: {
  open: boolean;
  onImport: (photos: Photo[]) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [bulkText, setBulkText] = useState("");
  const parsedPhotos = useMemo(() => parseBulkPhotos(bulkText), [bulkText]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!parsedPhotos.length) {
      return;
    }
    onImport(parsedPhotos);
    setBulkText("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量导入照片</DialogTitle>
          <DialogDescription>
            每行一张照片，按模板粘贴外链。标签请使用中文，多个标签用中文或英文逗号分隔。
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Textarea
            className="min-h-56 font-mono text-xs leading-6"
            value={bulkText}
            placeholder={
              "图片URL | 标题 | 日期YYYY-MM-DD | 地点 | 标签\nhttps://example.com/photo-1.jpg | 海边日落 | 2025-05-20 | 厦门 | 旅行,纪念日\nhttps://example.com/photo-2.jpg | 周末早餐 | 2025-06-01 | 家 | 日常,美食"
            }
            onChange={(event) => setBulkText(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            已识别 {parsedPhotos.length} 张照片。批量导入里的新标签会随照片一起保存，之后会出现在标签选择器里。
          </p>
          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X /> 取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!parsedPhotos.length}>
              <Images /> 导入照片
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileSettings({
  profile,
  onSave
}: {
  profile: Profile;
  onSave: (profile: Profile) => void;
}) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>基础设置</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field
            field={{ name: "personA", label: "你的名字" }}
            value={draft.names.personA}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                names: { ...current.names, personA: value }
              }))
            }
          />
          <Field
            field={{ name: "personB", label: "她的名字" }}
            value={draft.names.personB}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                names: { ...current.names, personB: value }
              }))
            }
          />
          <Field
            field={{ name: "startedAt", label: "恋爱开始日期", type: "date" }}
            value={draft.startedAt}
            onChange={(value) => setDraft((current) => ({ ...current, startedAt: value }))}
          />
          <div className="md:col-span-2">
            <Field
              field={{ name: "statement", label: "首页文案", type: "textarea" }}
              value={draft.statement}
              onChange={(value) => setDraft((current) => ({ ...current, statement: value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">
              <Save /> 保存基础设置
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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

function ImageValueField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    onChange(await saveImageFile(file));
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">图片</span>
      {value ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
          <MemoryImage src={value} alt="图片预览" fill className="object-cover" />
        </div>
      ) : null}
      <Input
        value={value}
        placeholder="粘贴图片 URL，或从相册选择"
        onChange={(event) => onChange(event.target.value)}
      />
      <Button asChild type="button" variant="outline" className="w-full">
        <label className="cursor-pointer">
          <ImagePlus /> 从相册选择图片
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
      </Button>
      <p className="text-xs text-muted-foreground">
        相册图片会保存到浏览器本地数据，适合少量精选照片。
      </p>
    </div>
  );
}

function PreviewImage({ item }: { item: Record<string, unknown> }) {
  const imageUrl = typeof item.imageUrl === "string" ? item.imageUrl : "";
  if (!imageUrl) {
    return <div className="hidden size-[72px] rounded-md bg-muted sm:block" />;
  }
  return (
    <div className="relative hidden size-[72px] overflow-hidden rounded-md bg-muted sm:block">
      <MemoryImage src={imageUrl} alt={String(item.title ?? "")} fill sizes="72px" className="object-cover" />
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
      tags: parseTags(draft.tags, ["礼物"])
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

function parseBulkPhotos(value: string): Photo[] {
  const today = new Date().toISOString().slice(0, 10);

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [imageUrl, title, date, location, tags] = line.split("|").map((part) => part.trim());
      if (!imageUrl) {
        return null;
      }
      const finalTitle = title || `照片 ${index + 1}`;
      return {
        id: createId("ph"),
        date: date || today,
        title: finalTitle,
        alt: finalTitle,
        imageUrl,
        location: location || "",
        tags: parseTags(tags || "日常")
      };
    })
    .filter((photo): photo is Photo => Boolean(photo));
}

function parseTags(value: string, fallback: Tag[] = ["日常"]): Tag[] {
  const tags = uniqueTags(value.split(/[，,]/).map((tag) => tag.trim()));
  return tags.length ? tags : fallback;
}
