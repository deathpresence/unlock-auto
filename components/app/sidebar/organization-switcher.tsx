"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OrganizationSwitcher({
  organizations,
  defaultOrganization,
}: {
  organizations: { id: string; name?: string }[];
  defaultOrganization: { id: string; name?: string } | null;
}) {
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = React.useState<string | null>(
    defaultOrganization?.id ?? null
  );
  const [orgs, setOrgs] = React.useState<{ id: string; name?: string }[]>(
    organizations || []
  );

  useEffect(() => {
    setOrgs(organizations || []);
  }, [organizations]);

  useEffect(() => {
    setSelectedOrgId(defaultOrganization?.id ?? null);
  }, [defaultOrganization?.id]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {orgs.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/autogermes.png"
                    alt="client"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">
                    {orgs.find((o) => o.id === selectedOrgId)?.name ??
                      selectedOrgId ??
                      "Выберите организацию"}
                  </span>
                  <span className="">Организация</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width)"
              align="start"
            >
              {/* {orgs.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onSelect={async () => {
                    setSelectedOrgId(org.id);
                    await setActiveOrganization({ organizationId: org.id });
                    // Navigate to chat so the Chat tab becomes selected
                    router.replace("/chat");
                  }}
                >
                  {org.name ?? org.id}
                  {org.id === selectedOrgId && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))} */}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton
            size="lg"
            className="cursor-pointer border"
            onClick={() => router.push("/organizations/new")}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <PlusCircle size={16} />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">Создайте организацию</span>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
