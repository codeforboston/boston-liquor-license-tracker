import { useRef, useEffect, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./BostonZipCodeMap.css";
import * as BostonZipCodeGeoJSON from "../../data/boston-zip-codes.json";

export const BostonZipCodeMap = () => {
  const mapContainer = useRef(null);
  const map = useRef<Map | null>(null);
  const lng = -71.0782;
  const lat = 42.3164;
  const zoom = 11;

  const hoverZipId = useRef<string | number | undefined>("");
  const popup = useRef();

  // {lng: -71.07826226470809, lat: 42.316413557174286}

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current || "",
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: "https://fonts.undpgeohub.org/fonts/{fontstack}/{range}.pbf",
      },
      center: [lng, lat],
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
          "fill-color": "#b41313",
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
          "line-color": "#b41313",
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
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true,
      })
    );

    // Create a popup, but don't add it to the map yet.
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.current.on("click", "boston", (e) => {
      const coordinates = e.lngLat;
      if (map.current) {
        const description = e.features?.[0].properties.ZIP5;
        popup.setLngLat(coordinates).setHTML(description).addTo(map.current);
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
  }, [lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div className="absolute">
        <div>Currently Available Transferable Licenses</div>
        44 licenses
      </div>
      <div ref={mapContainer} className="map" />
    </div>
  );
};
