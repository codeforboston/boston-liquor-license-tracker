import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/map-test/")({
  component: MapTestComponent,
});

function MapTestComponent() {
  return (
    <div>
      <h1>Map Test</h1>
      <p>
        This is a test page for the map component. It will be used to test
        different map libraries and features.
      </p>
      <Link to="/map-test/maplibre">MapLibre Boston Zip Codes Map</Link>
    </div>
  );
}
