"use client";

import { createContext, type ReactNode, useContext } from "react";

const ActiveOrgContext = createContext<boolean>(false);

export function ActiveOrgProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) {
  return (
    <ActiveOrgContext.Provider value={value}>
      {children}
    </ActiveOrgContext.Provider>
  );
}

export function useActiveOrg(): boolean {
  return useContext(ActiveOrgContext);
}
