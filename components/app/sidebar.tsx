import * as React from "react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher } from "@/components/app/organization-switcher";

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
};

export function AppSidebar({
  sidebar,
  ...props
}: React.ComponentProps<typeof Sidebar> & { sidebar: React.ReactNode }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between w-full">
          <Image src="/logo.svg" width={115} height={28} alt="Unlock" />
        </div>
        <OrganizationSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {sidebar}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
