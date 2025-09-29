"use client";

import { MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveOrg } from "@/components/app/active-org-provider";
import { cn } from "@/lib/utils";

export function ViewSwitcher() {
  const pathname = usePathname();
  const hasActiveOrg = useActiveOrg();

  const isChat = pathname?.startsWith("/chat");

  return (
    <div className="inline-flex h-8 items-center rounded-md border bg-muted p-1">
      {hasActiveOrg ? (
        <Link
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 font-medium text-sm md:px-3",
            isChat
              ? "bg-primary text-primary-foreground shadow"
              : "text-foreground/80 hover:text-foreground"
          )}
          href="/chat"
        >
          <MessageSquare className="md:hidden" size={14} />
          <span className="hidden md:inline">Чат</span>
        </Link>
      ) : (
        <span
          className={cn(
            "flex cursor-not-allowed items-center gap-1 rounded-md px-2 py-1 font-medium text-sm opacity-50 md:px-3",
            "text-foreground/50"
          )}
          title="Создайте или присоединитесь к организации"
        >
          <MessageSquare className="md:hidden" size={14} />
          <span className="hidden md:inline">Чат</span>
        </span>
      )}
      <Link
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1 font-medium text-sm md:px-3",
          isChat
            ? "text-foreground/80 hover:text-foreground"
            : "bg-primary text-primary-foreground shadow"
        )}
        href="/"
      >
        <Settings className="md:hidden" size={14} />
        <span className="hidden md:inline">Дашборд</span>
      </Link>
    </div>
  );
}
