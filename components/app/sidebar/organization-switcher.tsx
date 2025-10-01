"use client";

import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setActiveBranch } from "@/app/(app)/(dashboard)/dashboard/branches/branch-actions";
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
import type { Organization } from "@/db/global/schema";
import type { Branch } from "@/db/tenant/schema";

export function OrganizationSwitcher({
  defaultOrganization,
  branches,
  defaultBranch,
}: {
  defaultOrganization: Organization | null;
  branches: Branch[];
  defaultBranch: Branch | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    defaultBranch?.id ?? null
  );
  const [branchList, setBranchList] = useState<Branch[]>(branches || []);

  useEffect(() => {
    setBranchList(branches || []);
  }, [branches]);

  useEffect(() => {
    setSelectedBranchId(defaultBranch?.id ?? null);
  }, [defaultBranch?.id]);

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);

    startTransition(async () => {
      const result = await setActiveBranch(branchId);
      if (result.error) {
        setSelectedBranchId(defaultBranch?.id ?? null);
      } else {
        router.refresh();
      }
    });
  };

  const selectedBranch = branchList.find((b) => b.id === selectedBranchId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {defaultOrganization ? (
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
                  <span className="text-muted-foreground text-xs">
                    {defaultOrganization?.name ?? defaultOrganization?.id}
                  </span>
                  <span className="font-medium">
                    {selectedBranch?.name ?? "Выберите филиал"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              {branchList.length > 0 ? (
                branchList.map((branch) => (
                  <DropdownMenuItem
                    key={branch.id}
                    onSelect={() => handleBranchSelect(branch.id)}
                  >
                    {branch.name}
                    {branch.id === selectedBranchId && (
                      <Check className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem
                  onSelect={() => router.push("/dashboard/branches/new")}
                >
                  <PlusCircle className="mr-2 size-4" />
                  Создать филиал
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton
            className="cursor-pointer border"
            onClick={() => router.push("/dashboard/organizations/new")}
            size="lg"
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
