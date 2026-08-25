#!/usr/bin/env node
/**
 * dev/openapi-sync.mjs
 *
 * Regenerates public/api/openapi.json from public/api/openapi.yaml.
 * Keeps the JSON in lockstep with the YAML source of truth so the
 * Swagger UI and the agent validation stay aligned. Run automatically
 * as a prebuild step in `npm run build`.
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import * as yaml from "js-yaml";

const YAML_PATH = "public/api/openapi.yaml";
const JSON_PATH = "public/api/openapi.json";

const data = yaml.load(readFileSync(YAML_PATH, "utf8"));
const json = JSON.stringify(data, null, 2);
writeFileSync(JSON_PATH, json + "\n", "utf8");
const size = statSync(JSON_PATH).size;
console.log(`Synced ${JSON_PATH} (${size.toLocaleString()} bytes) from ${YAML_PATH}`);
