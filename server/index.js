const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8787;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

let tree = {};
try {
  tree = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (e) {
  tree = {};
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(function () {
    saveTimer = null;
    fs.writeFile(DATA_FILE, JSON.stringify(tree), function () {});
  }, 300);
}

function splitPath(p) {
  return (p || '').split('/').filter(Boolean);
}

function getAt(segments) {
  let node = tree;
  for (const seg of segments) {
    if (node == null || typeof node !== 'object') return null;
    node = node[seg];
  }
  return node === undefined ? null : node;
}

function setAt(segments, value) {
  if (segments.length === 0) {
    tree = value === null || value === undefined ? {} : value;
    return;
  }
  let node = tree;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (node[seg] == null || typeof node[seg] !== 'object') node[seg] = {};
    node = node[seg];
  }
  const last = segments[segments.length - 1];
  if (value === null || value === undefined) {
    delete node[last];
  } else {
    node[last] = value;
  }
}

/* a и b — массивы сегментов пути; связаны, если один — префикс другого */
function related(a, b) {
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.every(function (seg, i) { return seg === longer[i]; });
}

const subs = new Map(); // id -> { id, ws, path, segments }

function sendVal(sub) {
  if (sub.ws.readyState !== 1) return;
  const value = getAt(sub.segments);
  sub.ws.send(JSON.stringify({ t: 'val', id: sub.id, path: sub.path, value: value }));
}

function notify(changedSegments) {
  subs.forEach(function (sub) {
    if (related(changedSegments, sub.segments)) sendVal(sub);
  });
}

const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('nox-server ok');
});
const wss = new WebSocketServer({ server });

wss.on('connection', function (ws) {
  const localSubIds = new Set();

  ws.on('message', function (raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (msg.t === 'sub') {
      const segments = splitPath(msg.path);
      const sub = { id: msg.id, ws: ws, path: msg.path || '', segments: segments };
      subs.set(msg.id, sub);
      localSubIds.add(msg.id);
      sendVal(sub);
    } else if (msg.t === 'unsub') {
      subs.delete(msg.id);
      localSubIds.delete(msg.id);
    } else if (msg.t === 'set') {
      const segments = splitPath(msg.path);
      setAt(segments, msg.value === undefined ? null : msg.value);
      scheduleSave();
      notify(segments);
      if (msg.rid) ws.send(JSON.stringify({ t: 'ack', rid: msg.rid }));
    } else if (msg.t === 'update') {
      const changed = [];
      Object.keys(msg.updates || {}).forEach(function (p) {
        const segments = splitPath(p);
        setAt(segments, msg.updates[p] === undefined ? null : msg.updates[p]);
        changed.push(segments);
      });
      scheduleSave();
      changed.forEach(notify);
      if (msg.rid) ws.send(JSON.stringify({ t: 'ack', rid: msg.rid }));
    } else if (msg.t === 'get') {
      const segments = splitPath(msg.path);
      ws.send(JSON.stringify({ t: 'get', rid: msg.rid, path: msg.path, value: getAt(segments) }));
    }
  });

  ws.on('close', function () {
    localSubIds.forEach(function (id) {
      subs.delete(id);
    });
  });
});

server.listen(PORT, function () {
  console.log('nox-server listening on :' + PORT + ' (data: ' + DATA_FILE + ')');
});
