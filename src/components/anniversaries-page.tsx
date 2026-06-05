"use client";

import { motion } from "framer-motion";
import { Calendar, Cake, Clock, HeartHandshake } from "lucide-react";
import { useMemo } from "react";
import { useMemoryData } from "@/hooks/use-memory-data";
import { daysBetween, daysUntil, formatDate, nextDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AnniversariesPage() {
  const { data } = useMemoryData();
  const loveDays = daysBetween(data.profile.startedAt);

  const upcoming = useMemo(() => {
    return data.anniversaries
      .map((item) => ({
        ...item,
        next: nextDate(item.date, item.recurring),
        left: daysUntil(nextDate(item.date, item.recurring))
      }))
      .sort((a, b) => a.left - b.left);
  }, [data.anniversaries]);

  const nextAnniversary = upcoming.find((item) => item.type === "anniversary") ?? upcoming[0];
  const nextBirthday = upcoming.find((item) => item.type === "birthday");

  return (
    <section className="container pb-12">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<HeartHandshake className="size-5" />}
          label="在一起"
          value={`${loveDays}`}
          unit="天"
        />
        <StatCard
          icon={<Clock className="size-5" />}
          label="下一个纪念日"
          value={`${nextAnniversary?.left ?? 0}`}
          unit="天"
        />
        <StatCard
          icon={<Cake className="size-5" />}
          label="下一个生日"
          value={`${nextBirthday?.left ?? 0}`}
          unit="天"
        />
      </div>

      <div className="mt-8 grid gap-4">
        {upcoming.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
          >
            <Card>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{item.title}</h2>
                      <Badge variant={item.type === "birthday" ? "warm" : "secondary"}>
                        {item.type === "birthday"
                          ? "生日"
                          : item.type === "anniversary"
                            ? "纪念日"
                            : "重要日期"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      原始日期 {formatDate(item.date)} · 下一次 {formatDate(item.next.toISOString().slice(0, 10))}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-semibold">{item.left}</p>
                  <p className="text-xs text-muted-foreground">天后</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between text-muted-foreground">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-semibold tracking-tight">
          {value}
          <span className="ml-2 text-base font-normal text-muted-foreground">{unit}</span>
        </p>
      </CardContent>
    </Card>
  );
}
