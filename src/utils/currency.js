/* Валюта: золото → серебро → бронза → медь.
   1 золото = 10 серебра, 1 серебро = 100 бронзы, 1 бронза = 10 меди. */
var CUR_ORDER = ["gold", "silver", "bronze", "copper"];
var CUR_LABEL = { gold: "З", silver: "С", bronze: "Бр", copper: "М" };
var CUR_NAME = { gold: "Золото", silver: "Серебро", bronze: "Бронза", copper: "Медь" };
var CUR_RATE = { gold: 10000, silver: 1000, bronze: 10, copper: 1 };

function emptyCurrency() { return { gold: 0, silver: 0, bronze: 0, copper: 0 }; }

function toCopper(cur) {
  cur = cur || {};
  return CUR_ORDER.reduce(function (sum, k) { return sum + (cur[k] || 0) * CUR_RATE[k]; }, 0);
}

function fromCopper(total) {
  total = Math.max(0, Math.floor(total || 0));
  var out = emptyCurrency();
  CUR_ORDER.forEach(function (k) {
    out[k] = Math.floor(total / CUR_RATE[k]);
    total -= out[k] * CUR_RATE[k];
  });
  return out;
}

function fmtCurrency(cur) {
  cur = cur || {};
  var parts = CUR_ORDER.filter(function (k) { return cur[k]; }).map(function (k) { return cur[k] + CUR_LABEL[k]; });
  return parts.length ? parts.join(" ") : "0" + CUR_LABEL.copper;
}

export { CUR_ORDER, CUR_LABEL, CUR_NAME, CUR_RATE, emptyCurrency, toCopper, fromCopper, fmtCurrency };
