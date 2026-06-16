import { createFileRoute } from "@tanstack/react-router";
import Resources from "@/components/pages/resources/resources";

export const Route = createFileRoute("/resources")({
  component: Resources,
});
