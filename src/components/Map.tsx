import { useRef, useEffect, useState, } from 'react';
import type { ElementRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@src/styles/map.css';
import { layers } from "@src/protomaps-style";
import type { GeoJSON } from 'geojson';
// import { MapFocus } from '../map-controls/types';
import { filterGeojsonFeatures, addGeoJSONLayer } from '@src/utils/map-utils';

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
    // mapFocus?: MapFocus
}


export default function Map({ geojson, mapFocus, hideSearch }: MapProps) {
    const mapContainer = useRef<ElementRef<"div">>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [searchResults, setSearchResults] = useState<GeoJSON | null>(null);

    // Initialize MapLibre Map
    useEffect(() => {
        if (map.current) {
            return
        }
        map.current = new maplibregl.Map({
            container: mapContainer.current!,
            style: mapLibreMapStyle,
            center: [2.3522, 48.8566], // Paris coordinates
            zoom: 11,
            preserveDrawingBuffer: true
        });

        map.current.on('load', () => { setMapReady(true); });

        return () => {
            map.current?.remove();
            map.current = null;
        }
    }, []);

    // when searchresults changes, draw the new search results on the map
    useEffect(() => {
        if (mapReady && searchResults) {
            if (map.current.getLayer('geojson-layer')) {
                map.current.removeLayer('geojson-layer');
            }
            if (map.current.getSource('geojson-source')) {
                map.current.removeSource('geojson-source');
            }
            // add a marker for each feature
            const featuresWithMarkers = searchResults.features.filter((feature) => {
                return feature.geometry.type === "Point";
            })
            for (const feature of featuresWithMarkers) {
                console.log("Adding marker for this feature")
                console.log(feature)
                const marker = new maplibregl.Marker()
                    .setLngLat(feature.geometry.coordinates)
                    .addTo(map.current)
                    .setPopup(
                        new maplibregl.Popup({ closeOnClick: true, closeButton: false })
                            .setHTML(`<div>${feature.properties.name} ${feature.properties.website && `<a href="${feature.properties.website}">website</a>`}</div>`));
            }
            // map.current.fitBounds(map.current.getBounds(), { padding: 60, maxZoom: 15, maxDuration: 5000 });
        }
    }, [searchResults])

    // Update uploaded GeoJson Layer
    useEffect(() => {
        if (mapReady && geojson) {
            // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
            addGeoJSONLayer(map.current!!, geojson, 'uploaded-geojson');
        }
    }, [mapReady, geojson])

    // useEffect(() => {
    //     if (map.current && mapFocus) {
    //         if ("idx" in mapFocus && "type" in mapFocus) {
    //             // Focus by MapFeatureTypeAndId
    //             if(!geojson) {
    //                 return;
    //             }
    //             const feature = filterGeojsonFeatures(geojson, mapFocus.type)[mapFocus.idx]
    //             if (feature) {
    //                 const bbox = getBoundingBox(feature);
    //                 map.current.fitBounds(bbox, { padding: 60, maxZoom: 15, maxDuration: 5000 });
    //             }
    //         } else {
    //             // assume this is a GeolocationCoordinates
    //             map.current.flyTo({
    //                 center: [mapFocus.longitude, mapFocus.latitude],
    //                 zoom: 15,
    //                 maxDuration: 5000
    //             })

    //             addBlueDot(map.current, mapFocus);
    //         }


    //     }
    // }, [mapFocus, geojson])

    const takeScreenshot = () => {
        if (map.current) {
            map.current.getCanvas().toBlob((blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'screenshot.png';
                a.click();
            });
        }
    }

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const searchQuery = formData.get('query') as string;

        // Send search query to API endpoint
        // Example code:
        fetch(`/api/search-nominatim?q=${searchQuery}&format=geojson`)
            .then(response => response.json())
            .then(data => {
                // Process the response data
                console.log(data);

                // set search results
                setSearchResults(data);

                if (mapReady && data) {
                    if (map.current.getLayer('geojson-layer')) {
                        map.current.removeLayer('geojson-layer');
                    }
                    if (map.current.getSource('geojson-source')) {
                        map.current.removeSource('geojson-source');
                    }
                    map.current.addSource('geojson-source', {
                        type: 'geojson',
                        data: data
                    });
                    map.current.addLayer({
                        id: 'geojson-layer',
                        type: 'fill',
                        source: 'geojson-source',
                        paint: {
                            'fill-color': '#ff0000',
                            'fill-opacity': 0.75
                        }
                    });
                    map.current.fitBounds(map.current.getBounds(), { padding: 60, maxZoom: 15, maxDuration: 5000 });
                    addGeoJSONLayer(map.current!!, data, 'uploaded-geojson');
                }


            })
            .catch(error => {
                // Handle any errors
                console.error(error);
            });
    };



    return (
        <div className="map-wrap">
            <div ref={mapContainer} className="map" />
            <div className="top-right">
                {hideSearch !== "true" && (
                    <form className="search-form" onSubmit={handleSearch}>
                        <textarea name="query" placeholder="Overpass QL query"></textarea><br />
                        <button name="type" value="natural" type="submit">Search with natural language</button>
                        <button name="type" value="overpassQL" type="submit">Search with overpass query</button>
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
            </div>
        </div>
    );
}