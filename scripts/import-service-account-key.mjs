#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [keyFile] = process.argv.slice(2);

if (!keyFile) {
  console.error("Gunakan: node scripts/import-service-account-key.mjs /path/ke/service-account.json");
  process.exit(1);
}

let credentials;
try {
  credentials = JSON.parse(readFileSync(resolve(keyFile), "utf8"));
} catch {
  console.error("File JSON service account tidak dapat dibaca.");
  process.exit(1);
}

if (credentials.type !== "service_account" || !credentials.client_email || !credentials.private_key) {
  console.error("File bukan kredensial service account yang valid.");
  process.exit(1);
}

const envPath = resolve(".env.local");
let env = readFileSync(envPath, "utf8");

// The old manual attempt may contain a whole JSON document after this key.
// It is always appended at the end by the setup instructions, so discard only that broken tail.
const malformedKeyAt = env.search(/^GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="\{/m);
if (malformedKeyAt >= 0) env = env.slice(0, malformedKeyAt);

function upsert(key, value) {
  const line = `${key}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  env = pattern.test(env) ? env.replace(pattern, line) : `${env.replace(/\n*$/, "")}\n${line}\n`;
}

upsert("GOOGLE_SERVICE_ACCOUNT_EMAIL", credentials.client_email);
upsert("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", credentials.private_key);
writeFileSync(envPath, env);

console.log("Kredensial service account telah disimpan ke .env.local.");
