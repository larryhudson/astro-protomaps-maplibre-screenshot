import { useRef, useEffect, useState, } from 'react';
import type { ElementRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@src/styles/map.css';
import { layers } from "@src/protomaps-style";
import type { GeoJSON } from 'geojson';
import { addGeoJSONLayer } from '@src/utils/map-utils';

const mapLibreMapStyle: StyleSpecification = {
    version: 8,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sources: {
        "protomaps-mvt": {
            type: "vector",
            tiles: ["https://pmtiles.larryhudson.net/paris-v2-20240217/{z}/{x}/{y}.mvt"],
            maxzoom: 15,
            attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
        }
    },
    //  one of light, dark, white, black, grayscale or debug.
    layers: layers
}

interface MapProps {
    geojson?: GeoJSON; // Update the type of uploadedGeoJSON
}


export default function Map({ geojson, mapFocus, hideSearch }: MapProps) {
    const mapContainer = useRef<ElementRef<"div">>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const searchInput = useRef<HTMLInputElement>(null);
    const [mapReady, setMapReady] = useState(false);
    const [searchResults, setSearchResults] = useState<GeoJSON | null>(null);

    const initialCoords = [2.3522, 48.8566]
    const initialZoom = 12

    // Initialize MapLibre Map
    useEffect(() => {
        if (map.current) {
            return
        }
        map.current = new maplibregl.Map({
            container: mapContainer.current!,
            style: mapLibreMapStyle,
            center: initialCoords,
            zoom: initialZoom,
            preserveDrawingBuffer: true
        });

        map.current.on('load', () => { setMapReady(true); });

        return () => {
            map.current?.remove();
            map.current = null;
        }
    }, []);

    const takeScreenshot = () => {
        if (map.current) {
            const screenshotFilename = searchInput.current?.value || "screenshot";
            map.current.getCanvas().toBlob((blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${screenshotFilename}.png`;
                a.click();
            });
        }
    }

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const searchQuery = formData.get('query') as string;
        const markerType = formData.get('marker-type') as string;

        // get bounding box of map
        const bounds = map.current?.getBounds();
        const bbox = bounds?.toArray().flat();
        const bboxx1y1x2y2 = bbox?.join(",");

        console.log({ bboxx1y1x2y2 })

        // Send search query to API endpoint
        // Example code:
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&markerType=${markerType}&bbox=${bboxx1y1x2y2}`)
            .then(response => response.json())
            .then(data => {

                // set search results
                setSearchResults(data);

                if (mapReady && data) {
                    // if (map.current.getLayer('geojson-layer')) {
                    //     map.current.removeLayer('geojson-layer');
                    // }
                    // if (map.current.getSource('geojson-source')) {
                    //     map.current.removeSource('geojson-source');
                    // }
                    // map.current.addSource('geojson-source', {
                    //     type: 'geojson',
                    //     data: data
                    // });
                    // map.current.addLayer({
                    //     id: 'geojson-layer',
                    //     type: 'fill',
                    //     source: 'geojson-source',
                    //     paint: {
                    //         'fill-color': '#ff0000',
                    //         'fill-opacity': 0.75
                    //     }
                    // });
                    // map.current.fitBounds(map.current.getBounds(), { padding: 60, maxZoom: 15, maxDuration: 5000 });
                    addGeoJSONLayer(map.current!!, data, 'uploaded-geojson');
                }


            })
            .catch(error => {
                // Handle any errors
                console.error(error);
            });
    };

    const recenterMap = () => {
        map.current?.flyTo({ center: initialCoords, zoom: initialZoom });
    }

    return (
        <div className="map-wrap">
            <div ref={mapContainer} className="map" />
            <div className="top-right">
                {hideSearch !== "true" && (
                    <form className="search-form" onSubmit={handleSearch}>
                        <input name="query" ref={searchInput} placeholder="Search" aria-label="Search query" /><br />
                        <fieldset>
                            <legend>Marker type</legend>
                            <label>
                                <input type="radio" name="marker-type" value="marker" id="radio-marker" />
                                Marker
                            </label>
                            <label>
                                <input type="radio" name="marker-type" value="polygon" id="radio-polygon" />
                                Polygon
                            </label>
                        </fieldset>
                        <button type="submit">Search</button>
                    </form>
                )}
                {searchResults && (
                    <details className="search-results">
                        <summary>JSON dump</summary>
                        <pre>
                            {JSON.stringify(searchResults, null, 2)}
                        </pre>
                    </details>
                )}
                <button type="button" onClick={takeScreenshot}>Take screenshot</button>
                <button type="button" onClick={recenterMap}>Recenter map</button>
            </div>
        </div>
    );
}