const fs = require('fs');
const path = require('path');

const file = String.raw`C:\Users\bekas\Downloads\BI Solutions\Quantus\src\service-worker.ts`;
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const target = "        actions: [\n            { action: 'view', title: 'View Report' },\n            { action: 'dismiss', title: 'Dismiss' },\n        ],\n";

if (!content.includes(target)) {
  throw new Error('Service worker actions block already removed or not found.');
}

content = content.replace(target, '');
fs.writeFileSync(file, content, 'utf8');
console.log('Removed service worker notification actions block.');
