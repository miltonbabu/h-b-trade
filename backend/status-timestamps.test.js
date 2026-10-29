const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = (process.env.ADMIN_SOURCE || fs.readFileSync(path.join(__dirname, 'routes/admin.js'), 'utf8')).replace(/\r\n/g, '\n');

async function runHandler(route, body, existing, method = 'put') {
  const start = source.indexOf(`router.${method}(` + (method === 'post' ? '\n  ' : '') + JSON.stringify(route));
  assert.notEqual(start, -1);
  const handlerStart = source.indexOf('async (req, res) => {', start);
  const end = source.indexOf(method === 'post' ? '\n);' : '\n});', handlerStart);
  const handlerSource = method === 'post'
    ? source.slice(handlerStart, end).replace(/,\s*$/, '')
    : source.slice(handlerStart, end) + '\n}';
  const writes = [];
  const db = {
    getOne: async () => existing,
    run: async (sql, params) => { writes.push({ sql, params }); },
  };
  const handler = vm.runInNewContext(`(${handlerSource})`, {
    db, uuidv4: () => 'event-id', logger: { info() {}, error(error) { throw error; } },
    STATUS_LOCATION_MAP: {}, STATUS_DESCRIPTIONS: {},
  });
  const res = { json() {}, status() { return this; } };
  await handler({ body, params: { id: 'record-id' }, user: { id: 'admin-id' } }, res);
  return writes.filter(w => /INSERT INTO tracking/.test(w.sql));
}

for (const route of ['/requests/:id', '/service-requests/:id']) {
  test(`${route}: status change records a timestamped tracking event`, async () => {
    const events = await runHandler(route, { status: 'in_progress' }, { status: 'received', tracking_number: 'TRACK1' });
    assert.equal(events.length, 1);
    assert.ok(events[0].params.includes('TRACK1'));
    assert.ok(events[0].params.includes('in_progress'));
  });
  test(`${route}: unchanged status and field-only edits do not add events`, async () => {
    for (const body of [{ status: 'received' }, { name: 'Updated name' }]) {
      assert.equal((await runHandler(route, body, { status: 'received', tracking_number: 'TRACK1' })).length, 0);
    }
  });
  test(`${route}: event uses the new tracking number when changed together`, async () => {
    const events = await runHandler(route, { status: 'completed', tracking_number: 'NEW' }, { status: 'received', tracking_number: 'OLD' });
    assert.equal(events.length, 1);
    assert.ok(events[0].params.includes('NEW'));
  });
}

test('new order records its actual initial status', async () => {
  const events = await runHandler('/orders', { status: 'in_transit', tracking_number: 'TRACK1' }, {}, 'post');
  assert.equal(events.length, 1);
  assert.ok(events[0].params.includes('in_transit'));
});

test('recorded timeline timestamps remain visible after a status rollback', () => {
  for (const relative of ['tracking/page.tsx', 'services/track/page.tsx']) {
    const page = fs.readFileSync(path.join(__dirname, '../frontend/src/app', relative), 'utf8');
    assert.doesNotMatch(page, /ts && \(isCurrent \|\| (?:isPast|isCompleted)\)/);
    assert.match(page, /Not recorded/);
  }
});
