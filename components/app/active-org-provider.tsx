"use client";

import * as React from "react";

const ActiveOrgContext = React.createContext<boolean>(false);

export function ActiveOrgProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <ActiveOrgContext.Provider value={value}>{children}</ActiveOrgContext.Provider>
  );
}

export function useActiveOrg(): boolean {
  return React.useContext(ActiveOrgContext);
}


