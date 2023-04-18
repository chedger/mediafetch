const fetch = require("node-fetch");

const BING_API_KEY = process.env.BING_API_KEY;
const BING_IMAGE_SEARCH_URL = `https://api.bing.microsoft.com//bingcustomsearch/v7.0/images/search`;
const BING_VIDEO_SEARCH_URL = `https://api.bing.microsoft.com//bingcustomsearch/v7.0/videos/search`;

module.exports = async (req, res) => {
  const searchQuery = req.query.search;
  const searchType = req.query.type;

  if (!searchQuery) {
    res.status(400).json({ error: "Search query is required" });
    return;
  }

  let searchUrl;
  let searchTypeParams;
  if (searchType === "video") {
    searchUrl = BING_VIDEO_SEARCH_URL;
    searchTypeParams = "&videoLength=Short&videoLicense=All&count=1";
  } else {
    searchUrl = BING_IMAGE_SEARCH_URL;
    searchTypeParams = "&count=1";
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

  if (data.value && data.value.length > 0) {
    const item = data.value[0];
    const mediaUrl = searchType === "video" ? item.contentUrl : item.thumbnailUrl;
    const mediaType = searchType === "video" ? "video/mp4" : item.encodingFormat;

    const mediaResponse = await fetch(mediaUrl);
    const contentType = mediaResponse.headers.get("content-type");
    const mediaData = await mediaResponse.buffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Media-Type", mediaType);
    res.send(mediaData);
  } else {
    res.status(404).json({ error: "No media found" });
  }
};
