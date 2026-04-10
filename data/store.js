import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, 'data.json');

const defaultData = {
  adminPin: "8888",
  members: ["李卓", "晋华", "珊珊", "晓梅", "张伟"],
  tasks: [],
  currentWeek: null,
};

let cache = null;

export function loadData() {
  if (existsSync(DATA_PATH)) {
    const raw = readFileSync(DATA_PATH, 'utf-8');
    cache = JSON.parse(raw);
  } else {
    const dir = dirname(DATA_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    cache = { ...defaultData, members: [...defaultData.members], tasks: [...defaultData.tasks] };
    writeFileSync(DATA_PATH, JSON.stringify(cache, null, 2));
  }
  return cache;
}

export function saveData(newData) {
  cache = newData;
  const dir = dirname(DATA_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(DATA_PATH, JSON.stringify(newData, null, 2));
}

export function getData() {
  if (cache === null) {
    return loadData();
  }
  return cache;
}
