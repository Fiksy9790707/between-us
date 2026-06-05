"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useMemoryData } from "@/hooks/use-memory-data";
import type { Photo } from "@/types/memory";
import { tagLabels } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export function PhotosPage() {
  const { data } = useMemoryData();
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <section className="container pb-12">
      <div className="masonry">
        {data.photos.map((photo, index) => (
          <motion.button
            type="button"
            key={photo.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
            onClick={() => setSelected(photo)}
            className="mb-4 w-full break-inside-avoid overflow-hidden rounded-lg border bg-card text-left shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={photo.imageUrl}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{formatDate(photo.date)}</p>
              <h2 className="mt-1 font-semibold">{photo.title}</h2>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {photo.location}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="p-0">
          {selected ? (
            <>
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                <Image
                  src={selected.imageUrl}
                  alt={selected.alt}
                  fill
                  sizes="90vw"
                  className="object-cover"
                />
              </div>
              <DialogHeader className="px-5 pb-5">
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {formatDate(selected.date)} · {selected.location}
                </DialogDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tagLabels[tag]}
                    </Badge>
                  ))}
                </div>
              </DialogHeader>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
