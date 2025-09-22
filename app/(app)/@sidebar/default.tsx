"use client";

import {
  BookOpen,
  Building2,
  Car,
  Frame,
  Map,
  PieChart,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/app/sidebar/sidebar-nav-item";
import { Sidebar, SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { ComponentProps, useMemo } from "react";
import { useActiveOrg } from "@/components/app/active-org-provider";

const data = {
  navMain: [
    {
      title: "Организация",
      url: "#",
      icon: Building2,
      isActive: true,
      items: [
        {
          title: "Новая организация",
          url: "/organizations/new",
        },
        {
          title: "Информация",
          url: "#",
        },
        {
          title: "Биллинг",
          url: "#",
        },
      ],
    },
    {
      title: "Автосалоны",
      url: "#",
      icon: Car,
      items: [
        {
          title: "Добавить автосалон",
          url: "#",
        },
        {
          title: "Список автосалонов",
          url: "#",
        },
      ],
    },
    {
      title: "Настройки",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
    {
      title: "Документация",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export default function DashboardSidebar({
  ...props
}: ComponentProps<typeof Sidebar>) {
  const hasActiveOrg = useActiveOrg();

  const navItems = useMemo(() => {
    return data.navMain
      .filter((item) => {
        if (item.title === "Автосалоны" && !hasActiveOrg) return false;
        return true;
      })
      .map((item) => {
        if (item.title === "Организация") {
          const items = item.items?.filter((subItem) => {
            if (!hasActiveOrg && subItem.title === "Карточка организации") {
              return false;
            }
            if (hasActiveOrg && subItem.title === "Новая организация") {
              return false;
            }
            return true;
          });
          return { ...item, items };
        }
        return item;
      });
  }, [hasActiveOrg]);
  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item, idx) => (
          <NavMain item={item} key={idx} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
