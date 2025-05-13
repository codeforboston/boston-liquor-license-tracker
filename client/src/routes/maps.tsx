import { createFileRoute } from "@tanstack/react-router";
import Maps from "@/components/pages/maps/maps";

export const Route = createFileRoute("/maps")({
  component: Maps,
});
