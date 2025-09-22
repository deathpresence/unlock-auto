import * as React from "react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher } from "@/components/app/sidebar/organization-switcher";
import { User } from "better-auth";
import { UserNav } from "./user-nav";

const data = {
  versions: ["Дмитровское шоссе", "МКАД 44 км", "Варшавское шоссе"],
};

export function AppSidebar({
  sidebar,
  user,
  organization,
  organizations,
  ...props
}: React.ComponentProps<typeof Sidebar> & { sidebar: React.ReactNode } & {
  user?: User;
  organization?: any;
  organizations?: any[];
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center w-full p-2">
          <div>
            <Image src="/logo.svg" width={80} height={32} alt="Unlock" />{" "}
            <div className="text-lg font-semibold">ИИ Ассистент</div>
          </div>
        </div>
        <OrganizationSwitcher organizations={organizations || []} defaultOrganization={organization} />
      </SidebarHeader>
      <SidebarContent>
        {sidebar}
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>{user && <UserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
