export const defaultTags = [
  "第一次",
  "约会",
  "纪念日",
  "旅行",
  "礼物",
  "日常",
  "生日",
  "美食"
];

export function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

export function isChineseTag(tag: string) {
  return /[\u4e00-\u9fff]/.test(tag.trim());
}
