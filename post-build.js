/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const outDir = "out";
const oldDir = path.join(outDir, "_next");
const newDir = path.join(outDir, "next");

fs.renameSync(oldDir, newDir);
console.log("Renamed _next directory to next.");

function replaceInFiles(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceInFiles(filePath);
    } else if (/\.(html|css|js)$/.test(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      const updatedContent = content.replace(/_next\//g, "next/");
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, "utf8");
        console.log(`Updated paths in ${filePath}`);
      }
    }
  });
}
replaceInFiles(outDir);
console.log("Finished updating asset paths.");
