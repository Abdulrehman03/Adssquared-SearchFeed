import React, { useState, useEffect } from "react";
import { parseStringPromise } from "xml2js";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nextArgs, setNextArgs] = useState(null);
  const [error, setError] = useState("");

  const requiredParams = {
    mkt: "us",
    siteLink: "1",
    type: "bl02fns",
    affiliate: "adsuser2000129",
  };

  // Ensure required parameters exist in URL without modifying existing ones
  useEffect(() => {
    if (router.isReady) {
      const params = new URLSearchParams(window.location.search);
      let shouldUpdate = false;

      // Ensure query parameter is in sync
      if (params.has("Keywords")) {
        setQuery(params.get("Keywords") || "");
      }

      // Add missing required parameters
      Object.entries(requiredParams).forEach(([key, value]) => {
        if (!params.has(key)) {
          params.set(key, value);
          shouldUpdate = true;
        }
      });

      // If updates are required, update the URL without triggering an API call
      if (shouldUpdate) {
        router.replace(`?${params.toString()}`, undefined, { shallow: true });
      }
    }
  }, [router.query, router.isReady]);

  // API Call on Search Button Click
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setAds([]);
    setNextArgs(null);
    setError("");

    // Construct URL with existing parameters and update only keyword
    const params = new URLSearchParams(window.location.search);
    params.set("Keywords", query);

    router.push(`?${params.toString()}`, undefined, { shallow: true });

    try {
      const url = `/api/proxy?${params.toString()}`;

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ Keywords: query }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch ads");

      const xmlData = await response.text();
      const jsonData = await parseStringPromise(xmlData, { mergeAttrs: true });

      setAds(extractListings(jsonData));
      setNextArgs(jsonData.Results?.NextArgs?.[0] || null);
    } catch (error) {
      console.error("Error fetching ads:", error);
      setError("Failed to fetch ads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNextResults = async () => {
    if (!nextArgs) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams(window.location.search);
      const url = `/api/proxy?${params.toString()}&${nextArgs}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch more results");

      const xmlData = await response.text();
      const jsonData = await parseStringPromise(xmlData, { mergeAttrs: true });

      setAds((prevAds) => [...prevAds, ...extractListings(jsonData)]);
      setNextArgs(jsonData.Results?.NextArgs?.[0] || null);
    } catch (error) {
      console.error("Error fetching next results:", error);
      setError("Failed to load more results.");
    } finally {
      setLoading(false);
    }
  };

  function extractListings(data) {
    return (
      data?.Results?.ResultSet?.flatMap(
        (resultSet) => resultSet.Listing || []
      ) || []
    );
  }
  return (
    <div
      className="min-h-screen bg-gray-100 p-4 flex flex-col items-center"
      style={{ backgroundColor: "#f4f6fc" }}
    >
      <div className="max-w-3xl w-full">
        <div>
          <img src="/logo2.png" className="logo" alt="Logo" />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            className="flex-grow p-2 border rounded-lg searchField"
            placeholder="Type here to search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className={`px-4 py-2 text-white rounded-lg primaryButton ${
              !query.trim() || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleSearch}
            disabled={!query.trim() || loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        )}

        <div className="space-y-4">
          {ads.length > 0 ? (
            ads.map((ad, index) => (
              <div key={index} className="p-4 bg-white shadow rounded-lg">
                <h2 className="text-[25px] font-semibold mb-3">
                  {ad?.title?.[0] || "-- --"}
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
                  className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Learn More
                </a>
              </div>
            ))
          ) : !loading && searched ? (
            <div className="p-4 bg-white shadow rounded-lg text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                No Results Found
              </h2>
              <p className="text-sm text-gray-600">
                Try searching for something else or refine your query.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-white shadow rounded-lg text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Enter a search to see results
              </h2>
              <p className="text-sm text-gray-600">
                Type a keyword and click search.
              </p>
            </div>
          )}
        </div>

        {nextArgs && (
          <div className="flex justify-center mt-6">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
