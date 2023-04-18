document.getElementById('searchButton').addEventListener('click', function () {
    const searchQuery = document.getElementById('searchInput').value;
    fetch(`https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=YOUR_UNSPLASH_ACCESS_KEY`)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.results.length);
                const imageURL = data.results[randomIndex].urls.regular;
                document.getElementById('dynamicImage').src = imageURL;
            } else {
                alert('No images found for the search query.');
            }
        })
        .catch(error => {
            console.error('Error fetching image:', error);
        });
});
