"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

type ToastState = {
  id: number;
  kind: "success" | "error";
  text: string;
};

export function SaveToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    function show(kind: ToastState["kind"], text: string) {
      window.clearTimeout(timer);
      setToast({ id: Date.now(), kind, text });
      timer = window.setTimeout(() => setToast(null), 1800);
    }

    function handleSuccess() {
      show("success", "已保存");
    }

    function handleError() {
      show("error", "保存失败，请稍后重试");
    }

    window.addEventListener("between-us-save-success", handleSuccess);
    window.addEventListener("between-us-save-error", handleError);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("between-us-save-success", handleSuccess);
      window.removeEventListener("between-us-save-error", handleError);
    };
  }, []);

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-24 z-[80] mx-auto flex w-max max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border bg-background/95 px-4 py-2 text-sm shadow-soft backdrop-blur md:bottom-8"
        >
          <motion.span
            animate={
              toast.kind === "success"
                ? { scale: [1, 1.28, 1], rotate: [0, -8, 0] }
                : { scale: 1 }
            }
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={
              toast.kind === "success"
                ? "text-rose-500"
                : "text-muted-foreground"
            }
          >
            <Heart className="size-4 fill-current" />
          </motion.span>
          <span>{toast.text}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
