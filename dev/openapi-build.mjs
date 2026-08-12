// Build openapi.json from openapi.yaml.
// Reads api/openapi.yaml, writes api/openapi.json.

import { readFileSync, writeFileSync } from "fs";
import { load } from "js-yaml";

const yamlPath = new URL("../api/openapi.yaml", import.meta.url);
const jsonPath = new URL("../api/openapi.json", import.meta.url);

const data = load(readFileSync(yamlPath, "utf-8"));
writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
console.log(`Wrote ${jsonPath.pathname}`);
console.log(`  openapi: ${data.openapi}`);
console.log(`  paths:   ${Object.keys(data.paths).length}`);
console.log(`  schemas: ${Object.keys(data.components.schemas).length}`);
