import { getSearchResults } from "@src/search";

export async function GET({ url }) {
    // get the 'query' param from the search params
    const query = url.searchParams.get('query');
    const searchType = url.searchParams.get('type');

    const resultsGeoJson = await getSearchResults({
        query,
        searchType
    });

    return new Response(JSON.stringify(resultsGeoJson), {
        headers: {
            "content-type": "application/json; charset=utf-8",
        },
    })
}