# `astro-protomaps-maplibre-screenshot`

You can [read more about this in my blog post](https://larryhudson.io/protomaps-maplibre-screenshot/).

This is a little project for me to take screenshots of map locations using Protomaps, MapLibre and the OpenStreetMap Nominatim search API. Here's how it works:
- It uses MapLibre for the interactive map in the frontend.
- It uses Protomaps for the map tiles, self-hosted in a Cloudflare bucket, using a Cloudflare worker to route HTTP requests. I extracted the vector data for the Paris region using the [pmtiles CLI](https://docs.protomaps.com/pmtiles/cli#extract), then followed [these instructions to serve the pmtiles](https://docs.protomaps.com/deploy/cloudflare). 

I learned a lot from [Bishal Sapkota's project geojson-app](https://github.com/bishalspkt/geojson-app). Thank you Bishal!

You can view a video walkthrough here:
    
[![Video Walkthrough](https://img.youtube.com/vi/FGsWjBhFo3c/0.jpg)](https://www.youtube.com/watch?v=FGsWjBhFo3c)