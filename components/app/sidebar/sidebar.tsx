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
import type { Branch } from "@/db/tenant/schema";
import { UserNav } from "./user-nav";

export function AppSidebar({
  sidebar,
  user,
  organization,
  branches,
  defaultBranch,
  ...props
}: ComponentProps<typeof Sidebar> & { sidebar: ReactNode } & {
  user?: User;
  organization?: { id: string; name?: string } | null;
  branches: Branch[];
  defaultBranch: Branch | null;
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
          defaultBranch={defaultBranch}
          defaultOrganization={organization ?? null}
        />
      </SidebarHeader>
      <SidebarContent>{sidebar}</SidebarContent>
      <SidebarRail />
      <SidebarFooter>{user && <UserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
