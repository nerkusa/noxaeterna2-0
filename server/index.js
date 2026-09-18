const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8787;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const USERS_FILE = process.env.USERS_FILE || path.join(__dirname, 'users.json');

const ADMIN_LOGIN = 'nerki5';
const ADMIN_PASSWORD = 'nerki5';

let tree = {};
try {
  tree = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (e) {
  tree = {};
}

/* Логины/хеши паролей — отдельно от общего дерева, чтобы их нельзя было
   прочитать через обычный get/onValue (у того протокола нет прав доступа). */
let users = {};
try {
  users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
} catch (e) {
  users = {};
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(function () {
    saveTimer = null;
    fs.writeFile(DATA_FILE, JSON.stringify(tree), function () {});
  }, 300);
}

let usersSaveTimer = null;
function scheduleUsersSave() {
  if (usersSaveTimer) return;
  usersSaveTimer = setTimeout(function () {
    usersSaveTimer = null;
    fs.writeFile(USERS_FILE, JSON.stringify(users), function () {});
  }, 300);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
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
    } else if (msg.t === 'register') {
      const login = String(msg.login || '').trim();
      const password = String(msg.password || '');
      let error = null;
      if (!login || !password) error = 'Заполни логин и пароль';
      else if (login.length < 3) error = 'Логин слишком короткий (мин. 3 символа)';
      else if (password.length < 4) error = 'Пароль слишком короткий (мин. 4 символа)';
      else if (login.toLowerCase() === ADMIN_LOGIN.toLowerCase()) error = 'Этот логин занят';
      else if (users[login]) error = 'Такой логин уже есть';
      if (!error) {
        const salt = crypto.randomBytes(16).toString('hex');
        users[login] = { salt: salt, hash: hashPassword(password, salt) };
        scheduleUsersSave();
      }
      ws.send(JSON.stringify({ t: 'auth', rid: msg.rid, ok: !error, error: error, login: login, role: 'player' }));
    } else if (msg.t === 'login') {
      const login = String(msg.login || '').trim();
      const password = String(msg.password || '');
      if (login.toLowerCase() === ADMIN_LOGIN.toLowerCase() && password === ADMIN_PASSWORD) {
        ws.send(JSON.stringify({ t: 'auth', rid: msg.rid, ok: true, login: ADMIN_LOGIN, role: 'gm' }));
        return;
      }
      const u = users[login];
      const ok = !!u && hashPassword(password, u.salt) === u.hash;
      ws.send(JSON.stringify({ t: 'auth', rid: msg.rid, ok: ok, error: ok ? null : 'Неверный логин или пароль', login: login, role: 'player' }));
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
