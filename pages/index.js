import React, { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nextArgs, setNextArgs] = useState(null); // To store the NextArgs

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setAds([]);
    setNextArgs(null); // Reset NextArgs on a new search
    try {
      const encodedString = encodeURIComponent(query);
      const response = await fetch(
       `/api/proxy?Keywords=${encodedString}&mkt=us&enableFavicon=1&enableImageInAds=1&siteLink=1`,
        {
          method: "POST",
          body: JSON.stringify({ keyword: query }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setAds(extractListings(data));
      if (data.Results?.NextArgs?.length > 0) {
        setNextArgs(data.Results.NextArgs[0]); // Set NextArgs if it exists
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };
console.log(ads);

  const fetchNextResults = async () => {
    if (!nextArgs) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/proxy?${nextArgs}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setAds((prevAds) => [...prevAds, ...extractListings(data)]); // Append new results
      if (data.Results?.NextArgs?.length > 0) {
        setNextArgs(data.Results.NextArgs[0]); // Update NextArgs or set to null if none
      } else {
        setNextArgs(null); // Clear NextArgs if no further results
      }
    } catch (error) {
      console.error("Error fetching next results:", error);
    } finally {
      setLoading(false);
    }
  };

  function extractListings(data) {
    const listings = [];
    if (data.Results && Array.isArray(data.Results.ResultSet)) {
      data.Results.ResultSet.forEach((resultSet) => {
        if (Array.isArray(resultSet.Listing)) {
          listings.push(...resultSet.Listing);
        }
      });
    }
    return listings;
  }

  return (
    <div
      className="min-h-screen bg-gray-100 p-4 flex flex-col items-center"
      style={{ backgroundColor: "#f4f6fc" }}
    >
      <div className="max-w-3xl w-full">
        <div>
          <img src="/logo.png" className="logo" alt="Logo" />
        </div>
        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            className="flex-grow p-2 border 0 rounded-lg searchField"
            placeholder="Type here to search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className={`px-4 py-2 text-white rounded-lg primaryButton ${
              query.trim() === "" || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleSearch}
            disabled={query.trim() === "" || loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        )}
        {/* Ads Listing */}
        <div className="space-y-4">
          {ads.length > 0 ? (
            ads.map((ad, index) => (
              <div key={index} className="p-4 bg-white shadow rounded-lg">
                <h2 className="text-[25px] font-semibold mb-3">
                  {ad?.title[0] || "-- --"}
                </h2>
                <p className="text-sm text-gray-600">
                  {ad?.description?.[0] || "-- --"}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {ad?.siteHost?.[0] || "-- --"}
                </p>
                <a
  href={`https://${ad?.siteHost?.[0] || "#"}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{ background: '#004aad' }}
  className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
>
  Learn More
</a>

              </div>
            ))
          ) : !loading && !searched ? (
            <div className="p-4 bg-white shadow rounded-lg text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Enter a search to see results
              </h2>
              <p className="text-sm text-gray-600">
                Type a keyword and click search to get results.
              </p>
            </div>
          ) : (
            !loading && (
              <div className="p-4 bg-white shadow rounded-lg text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  No Results Found
                </h2>
                <p className="text-sm text-gray-600">
                  Try searching for something else or refine your search query.
                </p>
              </div>
            )
          )}
        </div>
        {/* Load More Button */}
        {nextArgs && (
          <div className="flex justify-center mt-6">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 primaryButton"
              onClick={fetchNextResults}
              disabled={loading}
            >
              
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}