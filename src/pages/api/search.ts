async function fetchfromNominatim({
    endpoint,
    query,
    format,
    params = {}
}) {
    const baseUrl = 'https://nominatim.openstreetmap.org/';

    const url = new URL(endpoint, baseUrl);

    url.searchParams.set('q', query);
    url.searchParams.set('format', format);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'User-Agent': 'https://github.com/larryhudson/astro-maplibre-screenshot'
        }

    });

    return response.json();
}

export async function GET({ url }) {
    const query = url.searchParams.get('q');
    const markerType = url.searchParams.get('markerType');
    const bbox = url.searchParams.get('bbox');
    const format = "geojson";
    const endpoint = "search";

    let params = {
        viewbox: bbox,
        bounded: 1
    };

    if (markerType === "polygon") {
        params = {
            polygon_geojson: 1
        }
    } else if (markerType === "point") {

    }

    const results = await fetchfromNominatim({
        endpoint,
        query,
        format,
        params
    });

    // Delay for 1 second before returning the response
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(JSON.stringify(results), {
        headers: {
            "content-type": "application/json; charset=utf-8",
        },
    })
}