"use client";

import { ChevronsUpDown, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function OrganizationSwitcher({
  organizations,
  defaultOrganization,
}: {
  organizations: { id: string; name?: string }[];
  defaultOrganization: { id: string; name?: string } | null;
}) {
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    defaultOrganization?.id ?? null
  );
  const [orgs, setOrgs] = useState<{ id: string; name?: string }[]>(
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
                className="border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    alt="client"
                    height={32}
                    src="/autogermes.png"
                    width={32}
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
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width)"
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
            className="cursor-pointer border"
            onClick={() => router.push("/organizations/new")}
            size="lg"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <PlusCircle size={16} />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">Создайте организацию</span>
            </div>{" "}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
