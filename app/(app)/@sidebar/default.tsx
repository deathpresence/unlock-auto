"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Building2,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/app/sidebar/sidebar-nav-item";
import { Sidebar, SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Организации",
      url: "#",
      icon: Building2,
      isActive: true,
      items: [
        {
          title: "Добавить организацию",
          url: "/organizations/new",
        },
        {
          title: "Список организаций",
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
      icon: Bot,
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
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {data.navMain.map((item, idx) => (
          <NavMain item={item} key={idx} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
