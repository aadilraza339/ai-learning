import fs from "fs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

let text = "";
const files = fs.readdirSync(".");
const pdfFile = files.find((f) => f.endsWith(".pdf"));

if (pdfFile) {
    console.log(`Processing PDF: ${pdfFile}`);
    const dataBuffer = fs.readFileSync(pdfFile);
    const data = await pdf(dataBuffer);
    text = data.text;
} else if (fs.existsSync("data.txt")) {
    console.log("Processing data.txt");
    text = fs.readFileSync("data.txt", "utf-8");
} else {
    console.log("No source file found (pdf or data.txt).");
    process.exit(1);
}

const chunks = text
    .split("\n")
    .filter((line) => line.trim().length > 0) // improved filter
    .map((chunk, i) => ({
        id: i,
        content: chunk.trim(),
    }));

fs.writeFileSync("chunks.json", JSON.stringify(chunks, null, 2));
console.log(`Created ${chunks.length} chunks`);
