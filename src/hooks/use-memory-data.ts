"use client";

import { useEffect, useMemo, useState } from "react";
import seed from "@/data/seed.json";
import type { MemoryData } from "@/types/memory";

const STORAGE_KEY = "between-us-memory-data";

const defaultData = seed as MemoryData;

const legacyTagMap: Record<string, string> = {
  first: "第一次",
  date: "约会",
  anniversary: "纪念日",
  travel: "旅行",
  gift: "礼物",
  daily: "日常",
  birthday: "生日",
  food: "美食"
};

export type CollectionKey = "timeline" | "photos" | "anniversaries" | "gifts" | "wishes";

type EntityMap = {
  timeline: MemoryData["timeline"][number];
  photos: MemoryData["photos"][number];
  anniversaries: MemoryData["anniversaries"][number];
  gifts: MemoryData["gifts"][number];
  wishes: MemoryData["wishes"][number];
};

type Entity = EntityMap[CollectionKey];

export function useMemoryData() {
  const [data, setData] = useState<MemoryData>(defaultData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(migrateMemoryData(JSON.parse(saved) as MemoryData));
      } catch {
        setData(defaultData);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, ready]);

  const actions = useMemo(
    () => ({
      upsert(key: CollectionKey, item: Entity) {
        setData((current) => {
          const collection = current[key] as Entity[];
          const exists = collection.some((entry) => entry.id === item.id);
          const nextCollection = exists
            ? collection.map((entry) => (entry.id === item.id ? item : entry))
            : [item, ...collection];
          return { ...current, [key]: nextCollection };
        });
      },
      upsertMany(key: CollectionKey, items: Entity[]) {
        setData((current) => {
          const collection = current[key] as Entity[];
          const nextCollection = items.reduce((next, item) => {
            const exists = next.some((entry) => entry.id === item.id);
            return exists
              ? next.map((entry) => (entry.id === item.id ? item : entry))
              : [item, ...next];
          }, collection);
          return { ...current, [key]: nextCollection };
        });
      },
      remove(key: CollectionKey, id: string) {
        setData((current) => ({
          ...current,
          [key]: current[key].filter((entry) => entry.id !== id)
        }));
      },
      updateProfile(profile: MemoryData["profile"]) {
        setData((current) => ({
          ...current,
          profile
        }));
      },
      reset() {
        setData(defaultData);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }),
    []
  );

  return { data, ready, actions };
}

function migrateMemoryData(data: MemoryData): MemoryData {
  return {
    ...data,
    timeline: data.timeline.map((item) => ({
      ...item,
      tags: migrateTags(item.tags)
    })),
    photos: data.photos.map((item) => ({
      ...item,
      tags: migrateTags(item.tags)
    })),
    gifts: data.gifts.map((item) => ({
      ...item,
      tags: migrateTags(item.tags)
    }))
  };
}

function migrateTags(tags: string[]) {
  return tags.map((tag) => legacyTagMap[tag] ?? tag);
}
