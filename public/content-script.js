console.log("Content script loaded successfully.");

let currentTarget = null;
const highlightClass = "scraper-highlight-element";

function highlightElement(element) {
  element.classList.add(highlightClass);
}

function removeHighlight(element) {
  element.classList.remove(highlightClass);
}

const handleMouseOver = (event) => {
  if (event.target instanceof HTMLElement) {
    currentTarget = event.target;
    highlightElement(currentTarget);
  }
};

const handleMouseOut = () => {
  if (currentTarget) {
    removeHighlight(currentTarget);
    currentTarget = null;
  }
};

const handleClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (event.target instanceof HTMLElement) {
    const clickedElement = event.target;

    const data = {
      tag: clickedElement.tagName,
      text: clickedElement.innerText.trim(),
      href: null,
      src: null,
      alt: null,
      html: null,
    };

    if (clickedElement.tagName === "A") {
      data.href = clickedElement.href;
    } else if (clickedElement.tagName === "IMG") {
      data.src = clickedElement.src;
      data.alt = clickedElement.alt;
      data.text = null;
    } else {
      data.html = clickedElement.innerHTML;
    }

    console.log("Element clicked, data extracted:", data);

    chrome.storage.local.get("scrapedData", (result) => {
      const existingData = result.scrapedData || [];
      const updatedData = [...existingData, data];
      chrome.storage.local.set({ scrapedData: updatedData });
    });
  }
};

function startSelection() {
  console.log("Starting element selection");

  const style = document.createElement("style");
  style.id = "scraper-styles";
  style.innerHTML = `
    .${highlightClass} {
      outline: 2px dashed #3B82F6 !important;
      background-color: rgba(59, 130, 246, 0.2) !important;
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(style);

  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);
  document.addEventListener("click", handleClick, { capture: true });
}

function stopSelection() {
  console.log("Stopping element selection.");

  if (currentTarget) {
    removeHighlight(currentTarget);
  }

  const styleElement = document.getElementById("scraper-styles");
  if (styleElement) {
    styleElement.remove();
  }

  document.removeEventListener("mouseover", handleMouseOver);
  document.removeEventListener("mouseout", handleMouseOut);
  document.removeEventListener("click", handleClick, { capture: true });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "TOGGLE_SELECTING") {
    if (message.shouldStart) {
      startSelection();
      sendResponse({ status: "Selection started" });
    } else {
      stopSelection();
      sendResponse({ status: "Selection stopped" });
    }
  }

  return true;
});
