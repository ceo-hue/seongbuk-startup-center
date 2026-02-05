"use client";

import { useEffect, useState } from "react";

export default function TestAPIPage() {
  const [results, setResults] = useState<any>({});

  useEffect(() => {
    testAPIs();
  }, []);

  const testAPIs = async () => {
    const endpoints = ["/api/programs", "/api/companies", "/api/notices", "/api/partners"];
    const testResults: any = {};

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint);
        testResults[endpoint] = {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          data: res.ok ? await res.json() : await res.text()
        };
      } catch (error: any) {
        testResults[endpoint] = {
          error: error.message
        };
      }
    }

    setResults(testResults);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-8 text-3xl font-bold">API Test Page</h1>

      {Object.entries(results).map(([endpoint, result]: [string, any]) => (
        <div key={endpoint} className="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-4">
          <h2 className="mb-2 text-xl font-semibold">{endpoint}</h2>

          {result.error ? (
            <div className="text-red-400">❌ Error: {result.error}</div>
          ) : (
            <>
              <div className={result.ok ? "text-green-400" : "text-red-400"}>
                Status: {result.status} {result.statusText}
              </div>

              {result.ok ? (
                <div className="mt-2">
                  <div className="text-blue-400">
                    ✅ Data count: {Array.isArray(result.data) ? result.data.length : 'N/A'}
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-700 p-2 text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <pre className="mt-2 rounded bg-gray-700 p-2 text-xs text-red-300">
                  {result.data}
                </pre>
              )}
            </>
          )}
        </div>
      ))}

      <button
        onClick={testAPIs}
        className="mt-4 rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
      >
        Retest APIs
      </button>
    </div>
  );
}
