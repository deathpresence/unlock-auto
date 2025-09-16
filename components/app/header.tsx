import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ViewSwitcher } from "./view-switcher";

export function AppHeader() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2  px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        <div className="ml-auto order-last">
          <ViewSwitcher />
        </div>
      </header>
    </>
  );
}
