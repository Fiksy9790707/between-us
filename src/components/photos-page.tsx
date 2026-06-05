"use client";

import { motion } from "framer-motion";
import { ImagePlus, MapPin } from "lucide-react";
import { useState } from "react";
import { useMemoryData } from "@/hooks/use-memory-data";
import type { Photo } from "@/types/memory";
import { fileBaseName } from "@/lib/file";
import { saveImageFile } from "@/lib/image-upload";
import { createId, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { MemoryImage } from "@/components/memory-image";

export function PhotosPage() {
  const { data, actions } = useMemoryData();
  const [selected, setSelected] = useState<Photo | null>(null);
  const [importing, setImporting] = useState(false);

  async function handlePhotoFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setImporting(true);
    const today = new Date().toISOString().slice(0, 10);
    const photos = await Promise.all(
      Array.from(files).map(async (file) => {
        const title = fileBaseName(file) || "相册照片";
        return {
          id: createId("ph"),
          date: today,
          title,
          alt: title,
          imageUrl: await saveImageFile(file),
          location: "",
          tags: ["日常"]
        } satisfies Photo;
      })
    );
    actions.upsertMany("photos", photos);
    setImporting(false);
  }

  return (
    <section className="container pb-12">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          可以直接从手机相册选择照片，保存后会出现在照片墙里。
        </p>
        <Button asChild variant="outline">
          <label className="cursor-pointer">
            <ImagePlus /> {importing ? "导入中" : "从相册添加"}
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handlePhotoFiles(event.target.files)}
            />
          </label>
        </Button>
      </div>
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
              <MemoryImage
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
                <MemoryImage
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
                      {tag}
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
