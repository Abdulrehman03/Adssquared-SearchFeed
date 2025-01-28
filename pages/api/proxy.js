import { parseStringPromise } from 'xml2js'; // Import xml2js

export default async function handler(req, res) {
    const { query } = req;
    const apiUrl = `http://searchfeed.adssquared.com/search?affiliate=adsuser2000129&${new URLSearchParams(query)}`;

    try {
        // Fetch XML data from the API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/xml', // Ensure the correct content type for XML
            },
        });

        const xmlData = await response.text(); // Get the XML response as text

        // Convert XML to JSON
        const jsonData = await parseStringPromise(xmlData, { mergeAttrs: true });

        // Send the JSON response
        res.status(200).json(jsonData);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong while converting XML to JSON.' });
    }
}
