"use client";

import { Building2, Car, Store } from "lucide-react";
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
      title: "Дилерские центры",
      url: "#",
      icon: Store,
      items: [
        {
          title: "Добавить",
          url: "/branches/new",
        },
        {
          title: "Список",
          url: "/branches",
        },
      ],
    },
    {
      title: "Авто",
      url: "#",
      icon: Car,
      items: [
        {
          title: "Авто в наличии",
          url: "/auto/in-stock",
        },
        {
          title: "Марки и модели",
          url: "/auto/models",
        },
        {
          title: "Комплектации",
          url: "/auto/trims",
        },
      ],
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
          if (item.title === "Автосалоны" && !hasActiveOrg) {
            return false;
          }
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
