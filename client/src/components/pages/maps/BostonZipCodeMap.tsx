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
import {
  BusinessLicense,
  EligibleBostonZipcode,
  eligibleBostonZipcodes,
  validateBusinessLicense,
} from "@/services/data-interface/data-interface";
import * as BostonZipCodeGeoJSON from "../../../data/boston-zip-codes.json";
import licenseData from "../../../data/licenses.json";
import DotPagination from "../../../components/ui/dot-pagination";
import mapStyles from "./BostonZipCodeMap.module.css";
import "./mapStyleOverrides.css";
import { ZipDetailsContent } from "./ZipDetailsContent";

/* Map Styles */

// Fill color if eligible zip code
const activeFillColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-active-fill")
  .trim();
const activeBorderColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-active-border")
  .trim();

// Fill color if hovered
const hoverFillColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-hover-fill")
  .trim();
const hoverBorderColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-hover-border")
  .trim();

// Fill color if selected
const pressedFillColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-pressed-fill")
  .trim();
const pressedBorderColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-pressed-border")
  .trim();

// Fill color if not eligible zip code
const inactiveFillColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-inactive-fill")
  .trim();
const inactiveBorderColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-map-inactive-border")
  .trim();

const borderWidth = 2;
/* End Map Styles */

/* Map Initialization */
const initializeMap = (
  map: RefObject<Map | null>,
  mapContainer: RefObject<HTMLDivElement | null>,
  onMapLoad?: () => void
) => {
  const zoom = 11;
  const center = {
    lng: -71.00957168341347,
    lat: 42.29991918352738,
  };

  map.current = new maplibregl.Map({
    container: mapContainer.current || "",
    style: {
      version: 8,
      sources: {},
      layers: [],
      glyphs: "https://fonts.undpgeohub.org/fonts/{fontstack}/{range}.pbf",
    },
    center: [center.lng, center.lat],
    dragRotate: false,
    minZoom: 11,
    maxZoom: 13.7,
    zoom: zoom,
    attributionControl: false
  });

  map.current.on("load", () => {
    if (!map.current) return;

    map.current.addSource("boston", {
      type: "geojson",
      data: BostonZipCodeGeoJSON as GeoJSON.FeatureCollection,
      // Use zipcode as the feature id so feature-state updates work
      // both for map clicks and for programmatic changes (pagination).
      promoteId: "ZIP5",
    });
    // Fill layer
    map.current.addLayer({
      id: "boston",
      type: "fill",
      source: "boston",
      layout: {},
      paint: {
        "fill-color": [
          "case",
          // change color of selected zip code area if clicked
          ["boolean", ["feature-state", "clicked"], false],
          pressedFillColor,
          ["boolean", ["feature-state", "hover"], false],
          hoverFillColor,
          // determines zip code area color: if zip code is eligible, use activeFillColor, otherwise use inactiveFillColor
          ["in", ["get", "ZIP5"], ["literal", Array.from(eligibleBostonZipcodes)]],
          activeFillColor,
          inactiveFillColor,
        ],
      },
    });
    // Inactive outline layer - rendered first
    map.current.addLayer({
      id: "boston-outline-inactive",
      type: "line",
      source: "boston",
      paint: {
        "line-color": inactiveBorderColor,
        "line-width": borderWidth,
      },
      filter: ["!", ["in", ["get", "ZIP5"], ["literal", Array.from(eligibleBostonZipcodes)]]],
    });
    // Active outline layer - rendered second (on top)
    map.current.addLayer({
      id: "boston-outline-active",
      type: "line",
      source: "boston",
      paint: {
        "line-color": ["case",
          ["boolean", ["feature-state", "clicked"], false],
          pressedBorderColor,
          ["boolean", ["feature-state", "hover"], false],
          hoverBorderColor,
          activeBorderColor,
        ],
        "line-width": borderWidth,
      },
      filter: ["in", ["get", "ZIP5"], ["literal", Array.from(eligibleBostonZipcodes)]],
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

    onMapLoad?.();
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
  setSelectedZip: Dispatch<SetStateAction<EligibleBostonZipcode>>,
  clickedFeatureId: RefObject<string | number | null | undefined>
) => {
  if (!map.current) return;

  map.current.on("click", "boston", (e) => {
    const feature = e.features?.[0];
    const zipCode = feature?.properties.ZIP5;
    
    if (map.current && feature && eligibleBostonZipcodes.has(zipCode)) {
      setSelectedZip(zipCode);
      if (clickedFeatureId?.current) {
        map.current.setFeatureState(
          { source: "boston", id: clickedFeatureId.current },
          { clicked: false }
        );
      }
      map.current.setFeatureState(
        { source: "boston", id: zipCode },
        { clicked: true }
      );
      clickedFeatureId.current = zipCode;
    }
  });

  map.current.on("mousemove", "boston", (e) => {
    const features = e.features;
    const zipCode = features?.[0]?.properties.ZIP5;
    if (features && features.length > 0 && map.current && eligibleBostonZipcodes.has(zipCode)) {
      // Change the cursor style as a UI indicator.
      map.current.getCanvas().style.cursor = "pointer";

      if (hoverZipId.current !== "") {
        // removes hover on previous shape
        map.current.setFeatureState(
          { source: "boston", id: hoverZipId.current },
          { hover: false }
        );
      }

      hoverZipId.current = zipCode;
      map.current.setFeatureState(
        { source: "boston", id: zipCode },
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

const getValidatedLicenseData = (): BusinessLicense[] => {
  const tmp = [];
  for (const license of licenseData) {
    const validated = validateBusinessLicense(license);
    if (validated.valid) {
      tmp.push(validated.data);
    }
  }
  return tmp;
};

export const BostonZipCodeMap = () => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const detailsCard = useRef(null);
  const hoverZipId = useRef<string | number | undefined>("");
  const clickedFeatureId = useRef<EligibleBostonZipcode | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const uniqueZips = Array.from(eligibleBostonZipcodes);

  const indexToZipCode: { [key: number]: string } = {};
  for (const [index, value] of uniqueZips.entries()) {
    indexToZipCode[index] = value;
  }

  const licenses = getValidatedLicenseData();
  const [selectedZip, setSelectedZip] = useState<EligibleBostonZipcode>(uniqueZips[0]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    initializeMap(map, mapContainer, () => setIsMapLoaded(true));
    initializeMouseActions(map, hoverZipId, setSelectedZip, clickedFeatureId);
  }, []);

  // Keep map highlight in sync when zipcode changes via pagination.
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    if (!selectedZip) return;

    if (clickedFeatureId.current) {
      map.current.setFeatureState(
        { source: "boston", id: clickedFeatureId.current },
        { clicked: false }
      );
    }

    map.current.setFeatureState(
      { source: "boston", id: selectedZip },
      { clicked: true }
    );
    clickedFeatureId.current = selectedZip;
  }, [isMapLoaded, selectedZip]);

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
        <div className="absolute flex flex-row justify-center items-center right-0 top-8 right-8">
          <div
            className={`${mapStyles.mapCard}`}
            ref={detailsCard}
            id="zip-code-details-card"
          >
            <ZipDetailsContent licenses={licenses} zipCode={selectedZip} />
            <div>
              {/* TODO(#369): pass in indexToZipCode for the tooltip data */}
              <DotPagination
                currentPage={selectedZip ? uniqueZips.indexOf(selectedZip) : 0}
                totalPages={uniqueZips.length}
                onPageChange={(newZipIndex) => {
                  setSelectedZip(uniqueZips[newZipIndex]);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
