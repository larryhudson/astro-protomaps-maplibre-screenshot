import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY
});

export async function getOverpassQuery(query: string) {

    const systemPrompt = `Turn the user's query into an Overpass QL query to find the data in the OpenStreetMap database. Return a JSON object in the following format:
    {
        query: "the user's query",
        overpassQL: "the Overpass QL query",
        explanation: "an explanation of the Overpass QL query"
    }

    Example:
    Input: 11th arrondissement of Paris
    Output: {
        query: "11th arrondissement of Paris",
        overpassQL: "[out:json][timeout:25];
        (
          relation["admin_level"="9"]["name"="Paris 11e Arrondissement"];
        );
        out body;
        >;
        out skel qt;",
        explanation: "This overpass query finds the 11th arrondissement in Paris"
    }

    Example:
    Input: museums in Paris
    Output: {
        query: "museums in Paris",
        overpassQL: "[out:json];
        area[name="Paris"][boundary=administrative]->.parisArea;
        (
          node["tourism"="museum"](area.parisArea);
          way["tourism"="museum"](area.parisArea);
          relation["tourism"="museum"](area.parisArea);
        );
        out body;
        >;
        out skel qt;",
        explanation: "This overpass query finds museums in Paris"
    }
    `

    const chatCompletion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: query,
            },
        ],
        model: 'gpt-3.5-turbo',
        response_format: {
            type: 'json_object'
        },
    })

    const responseStr = chatCompletion.choices[0].message.content;

    const responseData = JSON.parse(responseStr);

    return responseData;
}