#!/usr/bin/env node

import chalk from 'chalk';
import os from 'os';
import si from 'systeminformation';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import terminalImage from 'terminal-image';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imageDir = path.join(__dirname, 'assets');
const images = fs.readdirSync(imageDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
const randomImage = path.join(imageDir, images[Math.floor(Math.random() * images.length)]);

let asciiLines = [];

if (process.platform === 'win32') {
  try {
    const imageBuffer = fs.readFileSync(randomImage);
    const img = await terminalImage.buffer(imageBuffer, { width: '30%' });
    asciiLines = img.split('\n');
  } catch (err) {
    asciiLines = [chalk.red('Failed to load image on Windows. (switch to arch btw)')];
  }
} else {
  const chafa = spawnSync('chafa', [
    '--size=32x12',
    '--fill=block',
    '--symbols=block',
    randomImage
  ], { encoding: 'utf8' });

  if (chafa.error || !chafa.stdout) {
    asciiLines = [chalk.red('⚠️ Chafa not found or failed.')];
  } else {
    asciiLines = chafa.stdout.split('\n').map(line => chalk.hex('#00ffff')(line));
  }
}
const osInfo = await si.osInfo();
const cpu = await si.cpu();
const mem = await si.mem();
const uptime = os.uptime();

const infoLines = [
  `${chalk.bold("")} ${chalk.yellow("HaFetch")}`,
  `${chalk.white("-------------------")}`,
  `${chalk.bold("User:")} ${chalk.cyan(os.userInfo().username)}`,
  `${chalk.bold("OS:")} ${chalk.magenta(osInfo.distro)} ${chalk.magenta(osInfo.release)}`,
  `${chalk.bold("Kernel:")} ${chalk.blue(osInfo.kernel)}`,
  `${chalk.bold("Uptime:")} ${chalk.green(Math.floor(uptime / 60) + ' mins')}`,
  `${chalk.bold("CPU:")} ${chalk.cyan(cpu.manufacturer)} ${chalk.cyan(cpu.brand)}`,
  `${chalk.bold("Memory:")} ${chalk.red((mem.used / 1024 / 1024 / 1024).toFixed(2))} GB / ${chalk.red((mem.total / 1024 / 1024 / 1024).toFixed(2))} GB`
];

const verticalOffset = -20;
const emptyLines = Array(Math.max(0, verticalOffset)).fill('');
const outputLines = [];
const maxAsciiWidth = Math.max(...asciiLines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length));

for (let i = 0; i < Math.max(asciiLines.length, infoLines.length + 2); i++) {
  const ascii = (asciiLines[i] || '').padEnd(maxAsciiWidth, ' ');
  const info = (i >= 2 ? infoLines[i - 2] : '') || '';
  outputLines.push(`${ascii}    ${info}`);
}

console.log([
  ...emptyLines,
  '',
  ...outputLines
].join('\n'));
