const fetch = require("node-fetch");

const BING_API_KEY = process.env.BING_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
const BING_VIDEO_SEARCH_URL = `https://api.bing.microsoft.com/v7.0/custom/videos/search`;
const GOOGLE_IMAGE_SEARCH_URL = `https://www.googleapis.com/customsearch/v1`;

module.exports = async (req, res) => {
  const searchQuery = req.query.search;
  const searchType = req.query.type === "video" ? "video" : "image";

  if (!searchQuery) {
    res.status(400).json({ error: "Search query is required" });
    return;
  }

  let searchUrl;
  let searchTypeParams;
  const resultCount = 10;
  if (searchType === "video") {
    searchUrl = BING_VIDEO_SEARCH_URL;
    searchTypeParams = `&customconfig=474bf85a-27fb-4ca2-b874-baefb5cdcbcc&SafeSearch=Off&videoLength=Short&videoLicense=All&count=${resultCount}`;
  } else {
    searchUrl = GOOGLE_IMAGE_SEARCH_URL;
    searchTypeParams = `&cx=${GOOGLE_CSE_ID}&searchType=image&key=${GOOGLE_API_KEY}&num=${resultCount}`;
  }

  console.log(`Request URL: ${searchUrl}?q=${encodeURIComponent(searchQuery)}${searchTypeParams}`);
  const response = await fetch(
    `${searchUrl}?q=${encodeURIComponent(searchQuery)}${searchTypeParams}`,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": BING_API_KEY,
        "X-MSEdge-ClientID": "mediafetch",
        "X-MSEdge-ClientIP": "0.0.0.0",
      },
    }
  );
  const data = await response.json();
  console.log(`Response data:`, data);

  const results = searchType === "video" ? data.value : data.items;
  if (results && results.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.value.length);
    const item = data.value[randomIndex];
    const mediaUrl = searchType === "video" ? item.contentUrl : item.link;
    console.log(`Original media URL: ${mediaUrl}`);
    const mediaType = searchType === "video" ? "video/mp4" : "image/jpeg"; 

    const mediaResponse = await fetch(mediaUrl);
    const contentType = mediaResponse.headers.get("content-type");
    const mediaData = await mediaResponse.buffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Media-Type", mediaType);
    res.send(mediaData);
  } else {
    res.status(404).json({ error: "No media found" });
  }
