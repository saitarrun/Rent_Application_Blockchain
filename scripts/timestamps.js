#!/usr/bin/env node
// Print quick UNIX timestamps for start/end windows
// Usage:
//   pnpm time:examples               # now and +30 days
//   node scripts/timestamps.js 7     # now and +7 days

const days = Number(process.argv[2] || 30);
const now = Math.floor(Date.now() / 1000);
const end = now + days * 24 * 60 * 60;

function fmt(ts) {
  return `${ts}  ( ${new Date(ts * 1000).toISOString()} )`;
}

console.log("Start (now):", fmt(now));
console.log(`End (+${days} days):`, fmt(end));

