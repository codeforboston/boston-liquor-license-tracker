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

const MOBILE_BREAKPOINT = 768;
const DESKTOP_CENTER: [number, number] = [
  -71.00957168341347,
  42.29991918352738,
];
const MOBILE_CENTER: [number, number] = [
  -71.0755331435287, 
  42.21785639815536
];
const DESKTOP_MIN_ZOOM = 11;
const MOBILE_MIN_ZOOM = 10.1;
const DESKTOP_INITIAL_ZOOM = 11;
const MOBILE_INITIAL_ZOOM = 10.1;

const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

const getViewportCenter = () =>
  isMobileViewport() ? MOBILE_CENTER : DESKTOP_CENTER;

const getViewportZoomSettings = () => {
  const mobile = isMobileViewport();
  return {
    minZoom: mobile ? MOBILE_MIN_ZOOM : DESKTOP_MIN_ZOOM,
    zoom: mobile ? MOBILE_INITIAL_ZOOM : DESKTOP_INITIAL_ZOOM,
  };
};

const applyViewportZoomConstraints = (mapInstance: Map) => {
  const mobile = isMobileViewport();
  mapInstance.setMinZoom(mobile ? MOBILE_MIN_ZOOM : DESKTOP_MIN_ZOOM);

  if (!mobile && mapInstance.getZoom() < DESKTOP_MIN_ZOOM) {
    mapInstance.setZoom(DESKTOP_MIN_ZOOM);
  }
};

const applyViewportCenter = (mapInstance: Map) => {
  const mobile = isMobileViewport();
  mapInstance.jumpTo({
    center: getViewportCenter(),
    zoom: mobile ? MOBILE_INITIAL_ZOOM : DESKTOP_INITIAL_ZOOM,
  });
};

/* Map Initialization */
const initializeMap = (
  map: RefObject<Map | null>,
  mapContainer: RefObject<HTMLDivElement | null>,
  onMapLoad?: () => void
) => {
  const { minZoom, zoom } = getViewportZoomSettings();
  const center = getViewportCenter();

  map.current = new maplibregl.Map({
    container: mapContainer.current || "",
    style: {
      version: 8,
      sources: {},
      layers: [],
      glyphs: "https://fonts.undpgeohub.org/fonts/{fontstack}/{range}.pbf",
    },
    center,
    dragRotate: false,
    minZoom,
    maxZoom: 13.7,
    zoom,
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
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
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

  // Recalculate map dimensions when the viewport changes.
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const mapInstance = map.current;
    let wasMobile = isMobileViewport();

    // Handle viewport resize
    const handleResize = () => {
      mapInstance.resize();
      applyViewportZoomConstraints(mapInstance);

      const mobile = isMobileViewport();
      if (mobile !== wasMobile) {
        applyViewportCenter(mapInstance);
      }
      wasMobile = mobile;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMapLoaded]);

  return (
    <main className={mapStyles.mapPage}>
      <PageHeader
        collapsibleOnMobile
        headerTitle={<FormattedMessage id="map.header.title" />}
        headerText={<FormattedMessage id="map.header.text" />}
      />
      <div className={mapStyles.mapWrap}>
        {/* Map canvas */}
        <div ref={mapContainer} className={mapStyles.map} />
        {/* Zip details */}
        <div className={mapStyles.mapCardWrapper}>
          <div
            className={mapStyles.mapCard}
            id="zip-code-details-card"
          >
            <ZipDetailsContent licenses={licenses} zipCode={selectedZip} />
            <div className="hidden md:block">
              <DotPagination
                currentPage={selectedZip ? uniqueZips.indexOf(selectedZip) : 0}
                totalPages={uniqueZips.length}
                onPageChange={(newZipIndex) => {
                  setSelectedZip(uniqueZips[newZipIndex]);
                }}
                labels={uniqueZips}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
