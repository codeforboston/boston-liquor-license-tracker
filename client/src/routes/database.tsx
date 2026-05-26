import { createFileRoute } from "@tanstack/react-router";
import Database from "@/components/pages/database/database";

const DATABASE_SECTIONS = [
  "license-availability",
  "recent-applications",
] as const;

type DatabaseSection = (typeof DATABASE_SECTIONS)[number];

type DatabaseSearch = {
  zip?: string;
  section?: DatabaseSection;
  expand?: boolean;
};

function parseSection(value: unknown): DatabaseSection | undefined {
  return DATABASE_SECTIONS.includes(value as DatabaseSection)
    ? (value as DatabaseSection)
    : undefined;
}

export const Route = createFileRoute("/database")({
  validateSearch: (search: Record<string, unknown>): DatabaseSearch => ({
    zip: typeof search.zip === "string" ? search.zip : undefined,
    section: parseSection(search.section),
    expand: search.expand === true || search.expand === "true",
  }),
  component: Database,
});
