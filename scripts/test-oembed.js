const axios = require('axios');

async function testOEmbed(url) {
    console.log(`Testing oEmbed for: ${url}`);
    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        console.log(`Requesting: ${oembedUrl}`);

        const response = await axios.get(oembedUrl);
        console.log('--- oEmbed Response ---');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testOEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
testOEmbed('https://youtu.be/dQw4w9WgXcQ');
