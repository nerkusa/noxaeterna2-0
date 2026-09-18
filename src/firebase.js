/* Клиент локального realtime-бэкенда (замена Firebase Realtime Database).
   Держит тот же API — ref/set/get/onValue/update/remove/push — так что
   остальной код приложения не меняется. */

/* process.env.REACT_APP_WS_URL подставляется webpack'ом при сборке
   (CRA/DefinePlugin) — сам по себе идентификатор `process` в браузере
   не существует, поэтому проверять typeof process здесь нельзя. */
var WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8787';

var socket = null;
var connected = false;
var reconnectDelay = 500;
var outbox = [];
var subs = new Map();
var waiters = new Map();
var ridSeq = 1;
var subSeq = 1;

function flushOutbox() {
  while (outbox.length) socket.send(JSON.stringify(outbox.shift()));
}

function resubscribeAll() {
  subs.forEach(function (s, id) {
    socket.send(JSON.stringify({ t: 'sub', id: id, path: s.path }));
  });
}

function connect() {
  socket = new WebSocket(WS_URL);
  socket.onopen = function () {
    connected = true;
    reconnectDelay = 500;
    flushOutbox();
    resubscribeAll();
  };
  socket.onclose = function () {
    connected = false;
    setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 8000);
  };
  socket.onerror = function () {
    try { socket.close(); } catch (e) {}
  };
  socket.onmessage = function (ev) {
    var msg;
    try { msg = JSON.parse(ev.data); } catch (e) { return; }
    if (msg.t === 'val' && msg.id != null) {
      var s = subs.get(msg.id);
      if (s) s.cb(makeSnap(msg.value));
    } else if (msg.t === 'ack' && msg.rid != null) {
      var w = waiters.get(msg.rid);
      if (w) { waiters.delete(msg.rid); w.resolve(); }
    } else if (msg.t === 'get' && msg.rid != null) {
      var w2 = waiters.get(msg.rid);
      if (w2) { waiters.delete(msg.rid); w2.resolve(makeSnap(msg.value)); }
    } else if (msg.t === 'auth' && msg.rid != null) {
      var w3 = waiters.get(msg.rid);
      if (w3) { waiters.delete(msg.rid); w3.resolve({ ok: !!msg.ok, error: msg.error || null, login: msg.login, role: msg.role }); }
    } else if (msg.t === 'change_account' && msg.rid != null) {
      var w4 = waiters.get(msg.rid);
      if (w4) { waiters.delete(msg.rid); w4.resolve({ ok: !!msg.ok, error: msg.error || null, login: msg.login, role: msg.role }); }
    }
  };
}
connect();

function send(obj) {
  if (connected && socket && socket.readyState === 1) socket.send(JSON.stringify(obj));
  else outbox.push(obj);
}

function makeSnap(value) {
  var v = value === undefined ? null : value;
  return { val: function () { return v; }, exists: function () { return v !== null && v !== undefined; } };
}

function joinPath(base, child) { return base ? base + '/' + child : String(child); }

function ref(db, path) {
  return { path: path ? String(path).replace(/^\/+|\/+$/g, '') : '' };
}

function set(r, value) {
  return new Promise(function (resolve) {
    var rid = 'r' + (ridSeq++);
    waiters.set(rid, { resolve: resolve });
    send({ t: 'set', path: r.path, value: value === undefined ? null : value, rid: rid });
  });
}

function remove(r) { return set(r, null); }

function update(r, updates) {
  return new Promise(function (resolve) {
    var rid = 'r' + (ridSeq++);
    waiters.set(rid, { resolve: resolve });
    var abs = {};
    Object.keys(updates || {}).forEach(function (k) {
      abs[r.path ? joinPath(r.path, k) : k] = updates[k];
    });
    send({ t: 'update', updates: abs, rid: rid });
  });
}

function get(r) {
  return new Promise(function (resolve) {
    var rid = 'r' + (ridSeq++);
    waiters.set(rid, { resolve: resolve });
    send({ t: 'get', path: r.path, rid: rid });
  });
}

function onValue(r, cb) {
  var id = 's' + (subSeq++);
  subs.set(id, { path: r.path, cb: cb });
  send({ t: 'sub', id: id, path: r.path });
  return function unsub() {
    subs.delete(id);
    send({ t: 'unsub', id: id });
  };
}

function push(r) {
  var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return { path: joinPath(r.path, id) };
}

function authLogin(login, password) {
  return new Promise(function (resolve) {
    var rid = 'r' + (ridSeq++);
    waiters.set(rid, { resolve: resolve });
    send({ t: 'login', login: login, password: password, rid: rid });
  });
}

function authRegister(login, password) {
  return new Promise(function (resolve) {
    var rid = 'r' + (ridSeq++);
    waiters.set(rid, { resolve: resolve });
    send({ t: 'register', login: login, password: password, rid: rid });
  });
}

function authChangeAccount(room, oldLogin, currentPassword, newLogin, newPassword) {
  return new Promise(function (resolve) {
    var rid = 'r' + (ridSeq++);
    waiters.set(rid, { resolve: resolve });
    send({ t: 'change_account', room: room, oldLogin: oldLogin, currentPassword: currentPassword, newLogin: newLogin, newPassword: newPassword || null, rid: rid });
  });
}

var db = {};

export { db, ref, set, get, onValue, update, remove, push, authLogin, authRegister, authChangeAccount };
