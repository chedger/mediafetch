const fetch = require("node-fetch");

const BING_API_KEY = "bb8a883e772b42e4920e7703330884dd";
const BING_IMAGE_SEARCH_URL = `https://api.cognitive.microsoft.com/bing/v7.0/images/search`;
const BING_VIDEO_SEARCH_URL = `https://api.cognitive.microsoft.com/bing/v7.0/videos/search`;


module.exports = async (req, res) => {
  const searchQuery = req.query.search;
  const searchType = req.query.type;

  if (!searchQuery) {
    res.status(400).json({ error: "Search query is required" });
    return;
  }

  let searchUrl;
  if (searchType === "video") {
    searchUrl = BING_VIDEO_SEARCH_URL;
  } else {
    searchUrl = BING_IMAGE_SEARCH_URL;
  }

  const response = await fetch(
    `${searchUrl}?q=${encodeURIComponent(searchQuery)}&count=50`,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": BING_API_KEY,
      },
    }
  );
  const data = await response.json();

  if (data.value && data.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.value.length);
    const item = data.value[randomIndex];
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