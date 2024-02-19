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
    const format = "geojson";
    const endpoint = "search";

    const results = await fetchfromNominatim({
        endpoint,
        query,
        format,
        params: {
            polygon_geojson: 1
        }
    });

    return new Response(JSON.stringify(results), {
        headers: {
            "content-type": "application/json; charset=utf-8",
        },
    })
}