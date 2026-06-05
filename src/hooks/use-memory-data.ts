"use client";

import { useEffect, useMemo, useState } from "react";
import seed from "@/data/seed.json";
import type { MemoryData } from "@/types/memory";

const STORAGE_KEY = "between-us-memory-data";

const defaultData = seed as MemoryData;

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
        setData(JSON.parse(saved) as MemoryData);
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
