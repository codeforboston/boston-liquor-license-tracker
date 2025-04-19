import { createFileRoute } from "@tanstack/react-router";
import { BostonZipCodeMap } from "../../map-test/maplibre/BostonZipCodeMap";

export const Route = createFileRoute("/map-test/maplibre")({
  component: BostonZipCodeMap,
});
