"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Camera, MapPin } from "lucide-react";
import { useMemoryData } from "@/hooks/use-memory-data";
import { daysBetween, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemoryImage } from "@/components/memory-image";

export function HomePage() {
  const { data } = useMemoryData();
  const days = daysBetween(data.profile.startedAt);
  const featured = data.timeline.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <>
      <section className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-8 md:grid-cols-[1fr_0.9fr] md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <Badge variant="warm">Day {days}</Badge>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            {data.profile.names.personA} & {data.profile.names.personB}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground md:text-xl">
            {data.profile.statement}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/timeline">
                查看时间线 <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">管理回忆</Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3">
            <Metric label="在一起" value={`${days}`} unit="天" />
            <Metric label="回忆" value={`${data.timeline.length}`} unit="条" />
            <Metric label="照片" value={`${data.photos.length}`} unit="张" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-100/60 via-transparent to-neutral-200/80 blur-2xl dark:from-amber-500/10 dark:to-white/5" />
          {featured ? (
            <Card className="relative overflow-hidden rounded-lg">
              <div className="relative aspect-[4/5]">
                <MemoryImage
                  src={featured.imageUrl}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 text-white">
                  <p className="text-sm opacity-80">{formatDate(featured.date)}</p>
                  <h2 className="mt-1 text-2xl font-semibold">{featured.title}</h2>
                  <div className="mt-3 flex items-center gap-2 text-sm opacity-85">
                    <MapPin className="size-4" />
                    {featured.location}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="relative flex aspect-[4/5] items-center justify-center rounded-lg p-8 text-center text-muted-foreground">
              还没有时间线记录
            </Card>
          )}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-5 left-5 right-5 rounded-lg border bg-background/85 p-4 shadow-soft backdrop-blur"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Since
                </p>
                <p className="mt-1 font-medium">{formatDate(data.profile.startedAt)}</p>
              </div>
              <CalendarDays className="size-5 text-muted-foreground" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="container pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {data.timeline.slice(0, 3).map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[5/3]">
                <MemoryImage src={item.imageUrl} alt={item.title} fill sizes="33vw" className="object-cover" />
              </div>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Camera className="size-3.5" />
                  {formatDate(item.date)}
                </div>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">
        {value}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
