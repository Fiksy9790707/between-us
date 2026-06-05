"use client";

import { motion } from "framer-motion";
import { Gift as GiftIcon, MessageCircle, WalletCards } from "lucide-react";
import { useMemoryData } from "@/hooks/use-memory-data";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MemoryImage } from "@/components/memory-image";

export function GiftsPage() {
  const { data } = useMemoryData();

  return (
    <section className="container grid gap-4 pb-12 md:grid-cols-2 lg:grid-cols-3">
      {data.gifts
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((gift, index) => (
          <motion.article
            key={gift.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
          >
            <Card className="h-full overflow-hidden">
              <div className="relative aspect-[4/3]">
                <MemoryImage
                  src={gift.imageUrl}
                  alt={gift.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">{formatDate(gift.date)}</p>
                <h2 className="mt-2 text-xl font-semibold">{gift.title}</h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <GiftIcon className="size-4" />
                    {gift.scenario}
                  </p>
                  {gift.price ? (
                    <p className="flex items-center gap-2">
                      <WalletCards className="size-4" />
                      ¥{gift.price.toLocaleString("zh-CN")}
                    </p>
                  ) : null}
                  <p className="flex items-start gap-2 leading-6">
                    <MessageCircle className="mt-1 size-4 shrink-0" />
                    {gift.reaction}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {gift.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.article>
        ))}
    </section>
  );
}
