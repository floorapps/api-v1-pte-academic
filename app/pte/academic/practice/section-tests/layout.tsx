import { ReactNode } from "react";
import { AcademicProvider } from "@/components/pte/academic-context";

export default function AcademicSectionTestsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AcademicProvider>
      {children}
    </AcademicProvider>
  );
}