"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { LeadModal } from "@/components/lead/lead-modal";

interface LeadContextValue {
  open: (source: string) => void;
}

const LeadContext = createContext<LeadContextValue>({ open: () => {} });

export function useLead(): LeadContextValue {
  return useContext(LeadContext);
}

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("");

  const open = useCallback((nextSource: string) => {
    setSource(nextSource);
    setIsOpen(true);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <LeadContext.Provider value={value}>
      {children}
      <LeadModal open={isOpen} onOpenChange={setIsOpen} source={source} />
    </LeadContext.Provider>
  );
}
