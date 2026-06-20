const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3025";
const routes = ["/en", "/en/services", "/en/contact"];
const failures = [];

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&copy;/g, "©");
}

for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`);
  if (!response.ok) {
    failures.push(`${route}: HTTP ${response.status}`);
    continue;
  }

  const html = await response.text();
  const lang = html.match(/<html lang="([^"]+)"/i)?.[1] || "";
  const cjk = [...new Set(visibleText(html).match(/[\u3400-\u9fff]+/g) || [])];

  if (lang !== "en") failures.push(`${route}: html lang is "${lang}"`);
  if (cjk.length) failures.push(`${route}: Chinese text found: ${cjk.join(" | ")}`);
}

if (failures.length) {
  console.error("English content audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`English content audit passed for ${routes.length} routes.`);
