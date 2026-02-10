export interface LabEntry {
  id: string;
  title: string;
  href: string;
  description?: string;
}

export const labsConfig: LabEntry[] = [
  { id: "lab1", title: "Лабораторная 1", href: "/lab1" },
];
