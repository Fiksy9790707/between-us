"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, MapPinned, Soup, Sparkle } from "lucide-react";
import { useMemoryData } from "@/hooks/use-memory-data";
import type { WishItem } from "@/types/memory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryConfig: Record<
  WishItem["category"],
  { title: string; icon: React.ReactNode; tone: string }
> = {
  place: { title: "想去的地方", icon: <MapPinned className="size-4" />, tone: "地点" },
  food: { title: "想吃的店", icon: <Soup className="size-4" />, tone: "美食" },
  activity: { title: "想做的事", icon: <Sparkle className="size-4" />, tone: "体验" }
};

export function FuturePage() {
  const { data } = useMemoryData();
  const groups = (["place", "food", "activity"] as const).map((category) => ({
    category,
    items: data.wishes.filter((item) => item.category === category)
  }));

  return (
    <section className="container grid gap-5 pb-12 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group.category}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
              {categoryConfig[group.category].icon}
            </div>
            <h2 className="font-semibold">{categoryConfig[group.category].title}</h2>
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
                      <Image src={item.imageUrl} alt={item.title} fill sizes="33vw" className="object-cover" />
                    </div>
                  ) : null}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant={item.status === "done" ? "warm" : "secondary"}>
                          {item.status === "done" ? "已完成" : "未完成"}
                        </Badge>
                        <h3 className="mt-3 font-semibold">{item.title}</h3>
                      </div>
                      {item.status === "done" ? (
                        <CheckCircle2 className="size-5 text-amber-700 dark:text-amber-300" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" />
                      )}
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
    </section>
  );
}
