"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type FormEvent, useState } from "react";
import { ArrowRight, CalendarDays, Camera, Heart, MapPin, Send } from "lucide-react";
import { useMemoryData } from "@/hooks/use-memory-data";
import { createId, daysBetween, formatDate, todayDateString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemoryImage } from "@/components/memory-image";
import { Textarea } from "@/components/ui/textarea";

export function HomePage() {
  const { data, ready, actions } = useMemoryData();
  const [noteDraft, setNoteDraft] = useState("");

  if (!ready) {
    return <HomePageSkeleton />;
  }

  const days = daysBetween(data.profile.startedAt);
  const featured = data.timeline.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const coverImageUrl = data.profile.coverImageUrl || featured?.imageUrl;
  const latestNote = data.notes.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

  function submitNote(event: FormEvent) {
    event.preventDefault();
    const content = noteDraft.trim();
    if (!content) {
      return;
    }
    actions.upsert("notes", {
      id: createId("note"),
      date: todayDateString(),
      content,
      author: data.profile.names.personA || undefined
    });
    setNoteDraft("");
  }

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
          {coverImageUrl ? (
            <Card className="relative overflow-hidden rounded-lg">
              <div className="relative aspect-[4/5]">
                <MemoryImage
                  src={coverImageUrl}
                  alt={featured?.title ?? "首页封面"}
                  fill
                  priority
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 text-white">
                  <p className="text-sm opacity-80">
                    {data.profile.coverImageUrl ? "Cover" : featured ? formatDate(featured.date) : "Between Us"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {data.profile.coverImageUrl
                      ? `${data.profile.names.personA} & ${data.profile.names.personB}`
                      : featured?.title}
                  </h2>
                  {featured && !data.profile.coverImageUrl ? (
                    <div className="mt-3 flex items-center gap-2 text-sm opacity-85">
                      <MapPin className="size-4" />
                      {featured.location}
                    </div>
                  ) : null}
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

      <section className="container grid gap-4 pb-8 md:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              最新小纸条
            </div>
            {latestNote ? (
              <>
                <p className="mt-4 text-lg leading-8">{latestNote.content}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDate(latestNote.date)}
                  {latestNote.author ? ` · ${latestNote.author}` : ""}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                还没有小纸条。写下第一句就好。
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <form className="space-y-3" onSubmit={submitNote}>
              <Textarea
                value={noteDraft}
                placeholder="写一句今天想留给对方的话"
                className="min-h-24 resize-none"
                onChange={(event) => setNoteDraft(event.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!noteDraft.trim()}>
                  <Send /> 保存纸条
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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

function HomePageSkeleton() {
  return (
    <>
      <section className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-8 md:grid-cols-[1fr_0.9fr] md:py-12">
        <div className="max-w-2xl animate-pulse">
          <div className="h-7 w-24 rounded-full bg-muted" />
          <div className="mt-5 h-14 w-4/5 rounded-lg bg-muted md:h-20" />
          <div className="mt-4 h-6 w-full rounded bg-muted" />
          <div className="mt-3 h-6 w-2/3 rounded bg-muted" />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="h-10 w-full rounded-md bg-muted sm:w-36" />
            <div className="h-10 w-full rounded-md bg-muted sm:w-32" />
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-lg border bg-card p-4">
                <div className="h-3 w-14 rounded bg-muted" />
                <div className="mt-3 h-7 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-pulse">
          <div className="relative aspect-[4/5] rounded-lg bg-muted" />
          <div className="absolute -bottom-5 left-5 right-5 rounded-lg border bg-background/85 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-5 w-28 rounded bg-muted" />
              </div>
              <div className="size-5 rounded bg-muted" />
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="overflow-hidden">
              <div className="aspect-[5/3] animate-pulse bg-muted" />
              <CardContent className="space-y-3 pt-5">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
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
