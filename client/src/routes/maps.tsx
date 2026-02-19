import { createFileRoute } from "@tanstack/react-router";
import { BostonZipCodeMap } from "@/components/pages/maps/BostonZipCodeMap";

export const Route = createFileRoute("/maps")({
  component: BostonZipCodeMap,
});
