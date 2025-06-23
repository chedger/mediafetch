const fetch = require("node-fetch");

const GOOGLE_API_KEY = "AIzaSyAUon6c2xVmcYvsSFkU064tq77QzuLmm64";
const GOOGLE_CX = "166d93545867f4dbd";
const GOOGLE_SEARCH_URL = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&searchType=image`;

module.exports = async (req, res) => {
    const searchQuery = req.query.search;

    if (!searchQuery) {
        res.status(400).json({ error: "Search query is required" });
        return;
    }

    const start = Math.floor(Math.random() * 5) + 1; // randomize result page
    const response = await fetch(`${GOOGLE_SEARCH_URL}&q=${encodeURIComponent(searchQuery)}&fileType=jpg,jpeg,png,gif,mp4,webm&start=${start}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.items.length);
        let mediaUrl = data.items[randomIndex].link;
        const mediaType = data.items[randomIndex].mime;

        // handle facebook/instagram pages that require login
        try {
            const urlHost = new URL(mediaUrl).hostname;
            if (urlHost.includes('instagram.') || urlHost.includes('facebook.')) {
                const pageRes = await fetch(mediaUrl);
                const pageHtml = await pageRes.text();
                const ogMatch = pageHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
                if (ogMatch && ogMatch[1]) {
                    mediaUrl = ogMatch[1];
                }
            }
        } catch (e) {
            // ignore and fallback to original link
        }

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
