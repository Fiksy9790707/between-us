import type { Tag } from "@/types/memory";

export const tagLabels: Record<Tag, string> = {
  first: "第一次",
  date: "约会",
  anniversary: "纪念日",
  travel: "旅行",
  gift: "礼物",
  daily: "日常",
  birthday: "生日",
  food: "美食"
};

export const tagOptions = Object.entries(tagLabels).map(([value, label]) => ({
  value: value as Tag,
  label
}));
