"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { useMemoryData } from "@/hooks/use-memory-data";
import { defaultTags, uniqueTags } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TimelinePage() {
  const { data } = useMemoryData();
  const [tag, setTag] = useState<string>("all");

  const tags = useMemo(() => {
    return uniqueTags([...defaultTags, ...data.timeline.flatMap((item) => item.tags)]);
  }, [data.timeline]);

  const events = useMemo(() => {
    return data.timeline
      .filter((item) => tag === "all" || item.tags.includes(tag))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data.timeline, tag]);

  return (
    <section className="container pb-12">
      <div className="flex gap-2 overflow-x-auto pb-4">
        <FilterButton active={tag === "all"} onClick={() => setTag("all")}>
          全部
        </FilterButton>
        {tags.map((item) => (
          <FilterButton
            key={item}
            active={tag === item}
            onClick={() => setTag(item)}
          >
            {item}
          </FilterButton>
        ))}
      </div>

      <div className="relative mt-4">
        <div className="absolute bottom-0 left-4 top-0 w-px bg-border md:left-1/2" />
        <div className="space-y-8">
          {events.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.18) }}
              className={cn(
                "relative grid gap-4 pl-10 md:grid-cols-2 md:pl-0",
                index % 2 === 1 && "md:[&>div:first-child]:col-start-2"
              )}
            >
              <div className="absolute left-[0.55rem] top-8 size-4 rounded-full border-4 border-background bg-foreground md:left-1/2 md:-translate-x-1/2" />
              <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {item.location}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((itemTag) => (
                      <Badge key={itemTag} variant="outline">
                        {itemTag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      className="shrink-0"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
