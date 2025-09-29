"use client";

import {
  BookOpen,
  Building2,
  Car,
  Frame,
  PieChart,
  Settings2,
} from "lucide-react";
import { type ComponentProps, useMemo } from "react";
import { useActiveOrg } from "@/components/app/active-org-provider";
import { NavMain } from "@/components/app/sidebar/sidebar-nav-item";
import {
  type Sidebar,
  SidebarGroup,
  SidebarMenu,
} from "@/components/ui/sidebar";

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
  ],
};

export default function DashboardSidebar({
  ...props
}: ComponentProps<typeof Sidebar>) {
  const hasActiveOrg = useActiveOrg();

  const navItems = useMemo(
    () =>
      data.navMain
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
        }),
    [hasActiveOrg]
  );
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
