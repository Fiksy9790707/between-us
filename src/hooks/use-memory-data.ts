"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import seed from "@/data/seed.json";
import { requestAdminCode } from "@/lib/admin-access";
import { emptyMemoryData, type MemoryData } from "@/types/memory";

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
type DataSource = "loading" | "cloud" | "local";

export function useMemoryData() {
  const [data, setData] = useState<MemoryData>(defaultData);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<DataSource>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await fetch("/api/memory", { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as {
            cloudEnabled: boolean;
            data: MemoryData;
          };
          if (!cancelled) {
            const migratedData = migrateMemoryData(payload.data);
            setData(migratedData);
            setSource(payload.cloudEnabled ? "cloud" : "local");
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
            setReady(true);
          }
          return;
        }
      } catch {
        // Fall through to local data.
      }

      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!cancelled) {
        if (saved) {
          try {
            setData(migrateMemoryData(JSON.parse(saved) as MemoryData));
          } catch {
            setData(defaultData);
          }
        }
        setSource("local");
        setReady(true);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (nextData: MemoryData) => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));

      if (source !== "cloud") {
        return;
      }

      const code = requestAdminCode();
      if (!code) {
        throw new Error("Missing admin code.");
      }

      const response = await fetch("/api/memory", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-between-us-admin-code": code
        },
        body: JSON.stringify({ data: nextData })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    [source]
  );

  const updateData = useCallback(
    (updater: (current: MemoryData) => MemoryData) => {
      setData((current) => {
        const nextData = updater(current);
        void persist(nextData).catch(() => {
          window.alert("云端保存失败。请检查管理密码、Supabase 配置或网络状态。");
        });
        return nextData;
      });
    },
    [persist]
  );

  const actions = useMemo(
    () => ({
      upsert(key: CollectionKey, item: Entity) {
        updateData((current) => {
          const collection = current[key] as Entity[];
          const exists = collection.some((entry) => entry.id === item.id);
          const nextCollection = exists
            ? collection.map((entry) => (entry.id === item.id ? item : entry))
            : [item, ...collection];
          return { ...current, [key]: nextCollection };
        });
      },
      upsertMany(key: CollectionKey, items: Entity[]) {
        updateData((current) => {
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
        updateData((current) => ({
          ...current,
          [key]: current[key].filter((entry) => entry.id !== id)
        }));
      },
      updateProfile(profile: MemoryData["profile"]) {
        updateData((current) => ({
          ...current,
          profile
        }));
      },
      reset() {
        updateData(() => defaultData);
      },
      clearAll() {
        updateData((current) => emptyMemoryData(current.profile));
      }
    }),
    [updateData]
  );

  return { data, ready, source, actions };
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
