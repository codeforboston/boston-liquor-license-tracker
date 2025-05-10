import { createFileRoute } from "@tanstack/react-router";
import Database from "@/components/pages/database/database";

export const Route = createFileRoute("/database")({
  component: Database,
});
