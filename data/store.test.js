import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData, saveData, getData } from './store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, 'data.json');

// Clean up before tests
function cleanup() {
  if (existsSync(DATA_PATH)) rmSync(DATA_PATH);
}

describe('data/store.js', () => {
  before(() => cleanup());
  after(() => cleanup());

  it('loadData creates data.json with default structure when file missing', () => {
    cleanup(); // ensure no file
    const data = loadData();
    assert.ok(existsSync(DATA_PATH), 'data.json should be created');
    assert.equal(data.adminPin, '8888');
    assert.ok(Array.isArray(data.members));
    assert.equal(data.members.length, 5);
    assert.ok(data.members.includes('李卓'));
    assert.ok(data.members.includes('晋华'));
    assert.ok(data.members.includes('珊珊'));
    assert.ok(data.members.includes('晓梅'));
    assert.ok(data.members.includes('张伟'));
    assert.ok(Array.isArray(data.tasks));
    assert.equal(data.currentWeek, null);
  });

  it('getData returns cached data without disk read', () => {
    const data = getData();
    assert.ok(data !== null);
    assert.equal(data.adminPin, '8888');
  });

  it('saveData persists data to disk and updates cache', () => {
    const modified = { adminPin: '1234', members: ['Test'], tasks: [], currentWeek: null };
    saveData(modified);
    const onDisk = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
    assert.equal(onDisk.adminPin, '1234');
    const cached = getData();
    assert.equal(cached.adminPin, '1234');
  });

  it('loadData reads existing data.json without overwriting', () => {
    // Write custom data to disk
    const custom = { adminPin: '9999', members: ['Custom'], tasks: [{ id: 1 }], currentWeek: null };
    writeFileSync(DATA_PATH, JSON.stringify(custom, null, 2));
    const data = loadData();
    assert.equal(data.adminPin, '9999');
    assert.equal(data.members[0], 'Custom');
    assert.equal(data.tasks.length, 1);
  });
});
