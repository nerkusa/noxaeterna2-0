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

let connSeq = 1;

wss.on('connection', function (ws) {
  /* msg.id для подписок нумеруется на клиенте с нуля при каждой загрузке
     страницы, поэтому у двух одновременно подключённых вкладок (например,
     ГМ и игрок) id подписок совпадают ("s1", "s2", ...). Раньше subs был
     глобальной Map с ключом = голый msg.id — вторая вкладка молча
     затирала подписку первой на том же id, и та переставала получать
     обновления по этому узлу (баг с "не удаляется чат" и т.п.). Ключ
     теперь скоупится соединением. */
  const connId = connSeq++;
  const localSubKeys = new Set();

  ws.on('message', function (raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (msg.t === 'sub') {
      const segments = splitPath(msg.path);
      const key = connId + ':' + msg.id;
      const sub = { id: msg.id, ws: ws, path: msg.path || '', segments: segments };
      subs.set(key, sub);
      localSubKeys.add(key);
      sendVal(sub);
    } else if (msg.t === 'unsub') {
      const key = connId + ':' + msg.id;
      subs.delete(key);
      localSubKeys.delete(key);
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
    } else if (msg.t === 'change_account') {
      const room = String(msg.room || '').trim();
      const oldLogin = String(msg.oldLogin || '').trim();
      const currentPassword = String(msg.currentPassword || '');
      const newLogin = String(msg.newLogin || '').trim() || oldLogin;
      const newPassword = msg.newPassword ? String(msg.newPassword) : null;
      let error = null;
      const u = users[oldLogin];
      if (oldLogin.toLowerCase() === ADMIN_LOGIN.toLowerCase()) error = 'Аккаунт ГМ нельзя изменить здесь';
      else if (!u) error = 'Аккаунт не найден';
      else if (hashPassword(currentPassword, u.salt) !== u.hash) error = 'Неверный текущий пароль';
      else if (newLogin.length < 3) error = 'Логин слишком короткий (мин. 3 символа)';
      else if (newPassword !== null && newPassword.length < 4) error = 'Новый пароль слишком короткий (мин. 4 символа)';
      else if (newLogin.toLowerCase() === ADMIN_LOGIN.toLowerCase()) error = 'Этот логин занят';
      else if (newLogin.toLowerCase() !== oldLogin.toLowerCase() && users[newLogin]) error = 'Такой логин уже есть';
      if (!error) {
        const salt = newPassword !== null ? crypto.randomBytes(16).toString('hex') : u.salt;
        const hash = newPassword !== null ? hashPassword(newPassword, salt) : u.hash;
        if (newLogin !== oldLogin) delete users[oldLogin];
        users[newLogin] = { salt: salt, hash: hash };
        scheduleUsersSave();
        if (newLogin !== oldLogin && room) {
          const segsOld = splitPath('rooms/' + room + '/characters/' + oldLogin);
          const segsNew = splitPath('rooms/' + room + '/characters/' + newLogin);
          const charData = getAt(segsOld);
          if (charData !== null) {
            setAt(segsNew, charData);
            setAt(segsOld, null);
            scheduleSave();
            notify(segsOld);
            notify(segsNew);
          }
        }
      }
      ws.send(JSON.stringify({ t: 'change_account', rid: msg.rid, ok: !error, error: error, login: newLogin, role: 'player' }));
    } else if (msg.t === 'delete_account') {
      /* Удаление персонажа ГМ-ом должно полностью освобождать логин/пароль,
         иначе повторная регистрация под тем же именем падает с «логин занят». */
      const login = String(msg.login || '').trim();
      if (login && login.toLowerCase() !== ADMIN_LOGIN.toLowerCase() && users[login]) {
        delete users[login];
        scheduleUsersSave();
      }
      if (msg.rid) ws.send(JSON.stringify({ t: 'ack', rid: msg.rid }));
    }
  });

  ws.on('close', function () {
    localSubKeys.forEach(function (key) {
      subs.delete(key);
    });
  });
});

server.listen(PORT, function () {
  console.log('nox-server listening on :' + PORT + ' (data: ' + DATA_FILE + ')');
});
