export const runtime = "edge";

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const apiUrl = `http://searchfeed.adssquared.com/search?affiliate=adsuser2000129&${searchParams}`;

  try {
    // Fetch XML data from the API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/xml", // Ensure the correct content type for XML
      },
    });

    const xmlData = await response.text(); // Get the XML response as text

    // Return the XML response directly
    return new Response(xmlData, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    // Return an error response
    return new Response(
      JSON.stringify({ error: "Something went wrong while fetching XML." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
