var CSS = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap");

:root {
  --color-bg: #161826;
  --color-surface: #232532;
  --color-sunken: #1b1d29;
  --color-text: #e9e9ed;
  --color-text-muted: #9397ab;
  --color-accent: #9184d9;
  --color-accent-2: #a7a1db;
  --color-divider: #34374a;

  --space-1: 4px; --space-2: 6px; --space-3: 10px; --space-4: 14px; --space-6: 20px; --space-8: 28px;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;

  --shadow-sm: 0 0 0 1px var(--color-divider);
  --shadow-md: 0 0 0 1px var(--color-divider), 0 6px 18px rgba(0,0,0,.45);
  --shadow-lg: 0 0 0 1px var(--color-divider), 0 16px 40px rgba(0,0,0,.55);
}

*{box-sizing:border-box}
body{margin:0;font-family:'Inter',sans-serif}

@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:var(--color-divider);border-radius:3px}

/* ── Nocturne-компоненты, общие для всего приложения ── */

.n-card{
  background:var(--color-surface);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-sm);
  padding:var(--space-4);
}
.n-field label{
  display:block;font-size:12px;font-weight:500;color:var(--color-text-muted);
  margin-bottom:var(--space-2);
}
.n-input{
  width:100%;min-height:40px;padding:8px 12px;
  font:14px/1.3 'Inter',sans-serif;color:var(--color-text);caret-color:var(--color-accent);
  background:var(--color-sunken);border:1.5px solid var(--color-divider);border-radius:var(--radius-md);
  outline:none;transition:border-color .12s;
}
.n-input::placeholder{color:var(--color-text-muted)}
.n-input:focus{border-color:var(--color-accent)}
.n-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font:600 14px/1.2 'Inter',sans-serif;cursor:pointer;
  padding:11px 18px;border-radius:var(--radius-md);
  border:1.5px solid transparent;background:transparent;color:var(--color-text);
  transition:background .12s,border-color .12s;
}
.n-btn:disabled{opacity:.5;cursor:not-allowed}
.n-btn-primary{color:var(--color-accent);border-color:var(--color-accent)}
.n-btn-primary:hover:not(:disabled){background:rgba(145,132,217,.14)}
.n-btn-secondary{border-color:var(--color-divider);color:var(--color-text)}
.n-btn-secondary:hover:not(:disabled){background:rgba(233,233,237,.06)}
.n-btn-block{width:100%}
.n-tag{
  display:inline-flex;align-items:center;font-size:11px;font-weight:600;
  padding:3px 10px;border-radius:999px;letter-spacing:.02em;
}
`;

export { CSS };
