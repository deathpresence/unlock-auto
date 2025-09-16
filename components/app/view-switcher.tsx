"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewSwitcher() {
  const pathname = usePathname();

  const isChat = pathname?.startsWith("/chat") || pathname === "/";

  return (
    <div className="inline-flex items-center rounded-md bg-muted p-1 border h-8">
      <Link
        href="/"
        className={cn(
          "px-2 md:px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1",
          isChat
            ? "bg-primary shadow text-primary-foreground"
            : "text-foreground/80 hover:text-foreground"
        )}
      >
        <MessageSquare size={14} className="md:hidden" />
        <span className="hidden md:inline">Чат</span>
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          "px-2 md:px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1",
          isChat
            ? "text-foreground/80 hover:text-foreground"
            : "bg-primary shadow text-primary-foreground"
        )}
      >
        <Settings size={14} className="md:hidden" />
        <span className="hidden md:inline">Дашборд</span>
      </Link>
    </div>
  );
}
