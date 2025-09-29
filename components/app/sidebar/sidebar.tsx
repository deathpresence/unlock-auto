import type { User } from "better-auth";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { OrganizationSwitcher } from "@/components/app/sidebar/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";

const branches = [
  { id: "dmitrovskoe-shosse", name: "LADA Мусина" },
  { id: "mkad-44-km", name: "LADA Восстания" },
  { id: "varshavskoe-shosse", name: "LADA Минская" },
  { id: "lxiang-moskovskaya", name: "Lixiang Московская" },
  { id: "omoda-orenburgskiy-trakt", name: "OMODA Оренбургский тракт" },
];

export function AppSidebar({
  sidebar,
  user,
  organization,
  organizations,
  ...props
}: ComponentProps<typeof Sidebar> & { sidebar: ReactNode } & {
  user?: User;
  organization?: any;
  organizations?: any[];
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex w-full items-center p-2">
          <div>
            <Image alt="Unlock" height={32} src="/logo.svg" width={80} />{" "}
            <div className="font-semibold text-lg">ИИ Ассистент</div>
          </div>
        </div>
        <OrganizationSwitcher
          branches={branches}
          defaultBranch={{ id: "dmitrovskoe-shosse", name: "LADA Мусина" }}
          defaultOrganization={organization}
          organizations={organizations || []}
        />
      </SidebarHeader>
      <SidebarContent>{sidebar}</SidebarContent>
      <SidebarRail />
      <SidebarFooter>{user && <UserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
