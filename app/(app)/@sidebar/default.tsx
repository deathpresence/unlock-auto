import type { ComponentProps } from "react";
import type { Sidebar } from "@/components/ui/sidebar";
import DashboardSidebar from "./dashboard/page";

export default function DefaultSidebar(props: ComponentProps<typeof Sidebar>) {
  return <DashboardSidebar {...props} />;
}
