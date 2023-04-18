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

    const response = await fetch(`${GOOGLE_SEARCH_URL}&q=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.items.length);
        res.json({ imageUrl: data.items[randomIndex].link });
    } else {
        res.status(404).json({ error: "No images found" });
    }
};
