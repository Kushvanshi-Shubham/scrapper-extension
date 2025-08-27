import React, { useState, useEffect } from "react";
import { exportToCSV } from "@/utils/csvExporter";
import toast from "react-hot-toast";

type ExtractedDataType = {
  tag: string;
  text: string | null;
  href?: string | null;
  src?: string | null;
  alt?: string | null;
  html?: string | null;
};

export default function HomePage() {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedDataType[]>([]);
  useEffect(() => {
    const loadDataFromStorage = () => {
      chrome.storage.local.get("scrapedData", (result) => {
        if (result.scrapedData) {
          setExtractedData(result.scrapedData);
        }
      });
    };
    loadDataFromStorage();
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.scrapedData) {
        setExtractedData(changes.scrapedData.newValue || []);
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.addListener(handleStorageChange);
    };
  }, []);

  const handleSelectClick = () => {
    const newIsSelectingState = !isSelecting;
    setIsSelecting(newIsSelectingState);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "TOGGLE_SELECTING",
          shouldStart: newIsSelectingState,
        });
      }
    });

    if (newIsSelectingState) {
      setExtractedData([]);
      chrome.storage.local.set({ scrapedData: [] });
    }
  };

  const handleExportClick = () => {
    if (extractedData.length === 0) {
      toast.error("No data to export!");
      return;
    }
    exportToCSV(extractedData, "scraped-data.csv");
    toast.success("CSV exported successfully!");
  };

  return (
    <main className="w-96 p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800">
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Web Scraper
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select elements on the page to extract their data.
          </p>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSelectClick}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-offset-2 ${
              isSelecting
                ? "bg-red-600 hover:bg-red-500 focus-visible:outline-red-600"
                : "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
            }`}
          >
            {isSelecting ? "Stop Selecting" : "Start Selecting Elements"}
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
            Extracted Data
          </h3>
          <div className="mt-2 h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-2 overflow-y-auto">
            {extractedData.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {extractedData.map((item, index) => (
                  <li key={index} className="p-2 text-sm truncate">
                    <span className="font-mono text-xs font-semibold text-indigo-500 dark:text-indigo-400 mr-2">{`<${item.tag}>`}</span>
                    {item.src && (
                      <span className="text-blue-600 dark:text-blue-400">
                        src: {item.src}
                      </span>
                    )}
                    {item.href && (
                      <span className="text-green-600 dark:text-green-400">
                        href: {item.href}
                      </span>
                    )}
                    {item.text && (
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No data extracted yet.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleExportClick}
            disabled={extractedData.length === 0}
            className="w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Export to CSV
          </button>
        </div>
      </div>
    </main>
  );
}
