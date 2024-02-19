import osmtogeojson from 'osmtogeojson';
import { getOverpassQuery } from '@src/query-to-overpassql';
import { overpass } from 'overpass-ts';

export async function getSearchResults({ query, searchType }) {

    let overpassQuery = null;

    if (searchType === "overpassQL") {
        overpassQuery = query;
    } else {

        console.log("Searching for " + query);

        const overpassQueryResponse = await getOverpassQuery(query);

        console.log({ overpassQueryResponse })

        overpassQuery = overpassQueryResponse.overpassQL;

        if (!overpassQuery) {
            return new Response('No Overpass QL query found', { status: 400 });
        }
    }

    const overpassResponse = await overpass(overpassQuery).then(response => response.json());

    console.log({ overpassResponse })

    const geojson = osmtogeojson(overpassResponse);

    return geojson;
}