import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  useRef,
  useEffect,
  RefObject,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { FormattedMessage } from "react-intl";
import { PageHeader } from "@/components/ui/pageheader";
import * as BostonZipCodeGeoJSON from "../../data/boston-zip-codes.json";
import mapStyles from "./BostonZipCodeMap.module.css";
import "./mapStyleOverrides.css";
import { ZipDetailsContent } from "./ZipDetailsContent";
import { MapZipCodeData } from "./types";

const initializeMap = (
  map: RefObject<Map | null>,
  mapContainer: RefObject<HTMLDivElement | null>
) => {
  const zoom = 11;
  const center = {
    lng: -71.00884880372365,
    lat: 42.33759424383746,
  };

  const fillColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-map-red")
    .trim();

  map.current = new maplibregl.Map({
    container: mapContainer.current || "",
    style: {
      version: 8,
      sources: {},
      layers: [],
      glyphs: "https://fonts.undpgeohub.org/fonts/{fontstack}/{range}.pbf",
    },
    center: [center.lng, center.lat],
    zoom: zoom,
  });

  map.current.on("load", () => {
    if (!map.current) return;

    map.current.addSource("boston", {
      type: "geojson",
      data: BostonZipCodeGeoJSON as GeoJSON.FeatureCollection,
    });
    map.current.addLayer({
      id: "boston",
      type: "fill",
      source: "boston",
      layout: {},
      paint: {
        "fill-color": fillColor,
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0.5,
        ],
      },
    });
    map.current.addLayer({
      id: "boston-outline",
      type: "line",
      source: "boston",
      layout: {},
      paint: {
        "line-color": fillColor,
        "line-width": 2,
      },
    });
    map.current.addLayer({
      id: "symbols",
      type: "symbol",
      source: "boston",
      layout: {
        "text-field": ["get", "ZIP5"],
        "text-font": ["Open Sans Regular"],
      },
    });
  });
  map.current.addControl(
    new maplibregl.NavigationControl({
      showZoom: true,
      showCompass: false,
    }),
    "top-left"
  );
};

const initializeMouseActions = (
  map: RefObject<Map | null>,
  hoverZipId: RefObject<string | number | undefined>,
  setZipData: Dispatch<SetStateAction<MapZipCodeData | undefined>>
) => {
  if (!map.current) return;

  map.current.on("click", "boston", (e) => {
    const coordinates = e.lngLat;
    console.log(coordinates);
    if (map.current) {
      const zipCode = e.features?.[0].properties.ZIP5;
      // console.log(e.features?.[0].properties);
      setZipData({ zipCode, data: undefined });
    }
  });

  map.current.on("mousemove", "boston", (e) => {
    const features = e.features;
    if (features && features.length > 0 && map.current) {
      // Change the cursor style as a UI indicator.
      map.current.getCanvas().style.cursor = "pointer";

      if (hoverZipId.current !== "") {
        // removes hover on previous shape
        map.current.setFeatureState(
          { source: "boston", id: hoverZipId.current },
          { hover: false }
        );
      }

      hoverZipId.current = features[0].id;
      map.current.setFeatureState(
        { source: "boston", id: features[0].id },
        { hover: true }
      );
    }
  });

  map.current.on("mouseleave", "boston", () => {
    if (hoverZipId.current !== "" && map.current) {
      map.current.setFeatureState(
        { source: "boston", id: hoverZipId.current },
        { hover: false }
      );
      map.current.getCanvas().style.cursor = "default";
    }
  });
};

export const BostonZipCodeMap = () => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const detailsCard = useRef(null);
  const hoverZipId = useRef<string | number | undefined>("");

  const zips = BostonZipCodeGeoJSON.features.map((feature) => {
    return feature.properties.ZIP5;
  });
  const uniqueZips = new Set(zips);
  console.log({ uniqueZips });

  const [zipData, setZipData] = useState<MapZipCodeData>();

  // Initialize map
  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    initializeMap(map, mapContainer);
    initializeMouseActions(map, hoverZipId, setZipData);
  }, []);

  return (
    <main>
      <PageHeader
        headerTitle={<FormattedMessage id="map.header.title" />}
        headerText={<FormattedMessage id="map.header.text" />}
      />
      <div className={mapStyles.mapWrap}>
        {/* Map canvas */}
        <div ref={mapContainer} className={mapStyles.map} />
        {/* Zip details */}
        <div className="absolute flex flex-row justify-center items-center right-0 h-full">
          <div
            className={`${mapStyles.mapCard} mr-8`}
            ref={detailsCard}
            id="zip-details-card"
          >
            <ZipDetailsContent zipData={zipData} />
          </div>
        </div>
      </div>
    </main>
  );
};
