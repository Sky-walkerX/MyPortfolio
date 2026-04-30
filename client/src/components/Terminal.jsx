import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * namanOS — a tiny CLI overlay for navigating the portfolio.
 * Toggle: backtick (`), tilde (~), or the floating `>_ TERMINAL` button.
 * Close:  Escape, or the `exit` / `:q` command.
 * Clear:  Ctrl+L or `clear`.
 */

const ASCII_BANNER = String.raw`
 ███▄    █  ▄▄▄       ███▄ ▄███▓ ▄▄▄       ███▄    █
 ██ ▀█   █ ▒████▄    ▓██▒▀█▀ ██▒▒████▄     ██ ▀█   █
▓██  ▀█ ██▒▒██  ▀█▄  ▓██    ▓██░▒██  ▀█▄  ▓██  ▀█ ██▒
▓██▒  ▐▌██▒░██▄▄▄▄██ ▒██    ▒██ ░██▄▄▄▄██ ▓██▒  ▐▌██▒
▒██░   ▓██░ ▓█   ▓██▒▒██▒   ░██▒ ▓█   ▓██▒▒██░   ▓██░
░ ▒░   ▒ ▒  ▒▒   ▓▒█░░ ▒░   ░  ░ ▒▒   ▓▒█░░ ▒░   ▒ ▒
░ ░░   ░ ▒░  ▒   ▒▒ ░░  ░      ░  ▒   ▒▒ ░░ ░░   ░ ▒░
   ░   ░ ░   ░   ▒   ░      ░     ░   ▒      ░   ░ ░
         ░       ░  ░       ░         ░  ░         ░
`;

const SECTIONS = {
  hero: '#hero',
  about: '#about',
  projects: '#projects',
  blogs: '#blogs',
  achievements: '#achievements',
  experience: '#experience',
  contact: '#contact',
};

const SOCIALS = {
  github: 'https://github.com/Sky-walkerX',
  linkedin: 'https://www.linkedin.com/in/naman-khandelwal-53161829a/',
  twitter: 'https://twitter.com/NamanKh07423765',
  x: 'https://twitter.com/NamanKh07423765',
  medium: 'https://medium.com/@namankhandelwal',
};

const RESUME_URL = '/assets/resume.pdf';
const ACCENTS = ['default', 'cyan', 'magenta', 'crimson', 'emerald', 'amber', 'violet'];

const HELP_LINES = [
  'available commands:',
  '',
  '  help                 show this help',
  '  ls                   list sections',
  '  cd <section>         navigate to a section (alias: goto)',
  '  whoami               who is this guy',
  '  about | projects     jump to a section directly',
  '  blogs | experience   ...same',
  '  achievements | contact',
  '  social <name>        open a social link (github|linkedin|twitter|medium)',
  '  resume               open my resume',
  '  theme <name>         switch accent color: ' + ACCENTS.join(' | '),
  '  banner               print the banner',
  '  date                 current date',
  '  echo <text>          say it back',
  '  clear                clear the terminal (also: Ctrl+L)',
  '',
  '  there might be a few hidden ones. try things.',
];

const WHOAMI = [
  'naman khandelwal',
  '  full-stack developer & competitive programmer',
  '  builds clean, performant web experiences with a soft spot for 3d & motion',
  '  currently: shipping side projects, grinding cp, exploring graphics on the web',
  '',
  '  type `cd projects` to see what i\'ve been building.',
];

const LS_OUTPUT = [
  'sections/',
  '  hero/         landing — astronaut + galaxy',
  '  about/        bento grid, tech stack, coding stats',
  '  projects/     selected work',
  '  blogs/        writing & resume',
  '  achievements/ trophies in motion',
  '  experience/   timeline',
  '  contact/      say hi',
];

function nowDate() {
  return new Date().toString();
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function Prompt() {
  return (
    <>
      <span className="term-prompt-user">naman</span>
      <span className="term-prompt-host">@cosmos</span>
      <span className="term-mute">:~$</span>
    </>
  );
}

function Line({ entry }) {
  if (entry.kind === 'banner') {
    return <pre className="term-banner">{ASCII_BANNER}</pre>;
  }
  if (entry.kind === 'cmd') {
    return (
      <div className="term-inputline">
        <Prompt />
        <span className="term-cmd">{entry.text}</span>
      </div>
    );
  }
  const cls =
    entry.kind === 'err' ? 'term-err'
    : entry.kind === 'ok' ? 'term-ok'
    : entry.kind === 'mute' ? 'term-mute'
    : 'term-out';
  return <div className={cls}>{entry.text}</div>;
}

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]); // command history (for arrow keys)
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  const initialLines = useMemo(() => ([
    { kind: 'banner' },
    { kind: 'welcome', text: 'welcome to namanOS — a portfolio in the form of a shell' },
    { kind: 'welcome', text: 'type `help` to see what is possible, or `ls` to look around' },
    { kind: 'mute', text: 'type `help` to start. press ESC or `~` to close.' },
  ]), []);

  const [lines, setLines] = useState(initialLines);

  const push = useCallback((entry) => {
    setLines((prev) => [...prev, entry]);
  }, []);

  const reset = useCallback(() => setLines(initialLines), [initialLines]);

  const run = useCallback((raw) => {
    const text = raw.trim();
    if (!text) {
      push({ kind: 'cmd', text: '' });
      return;
    }
    push({ kind: 'cmd', text });
    setHistory((h) => (h[h.length - 1] === text ? h : [...h, text]));
    setHistIdx(-1);

    const [cmdRaw, ...rest] = text.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(' ');

    const goto = (key) => {
      const id = (SECTIONS[key] || '').replace('#', '');
      if (id && scrollToSection(id)) {
        push({ kind: 'ok', text: `→ navigating to /${key}` });
        // close shortly so the user sees the section
        setTimeout(() => setOpen(false), 350);
      } else {
        push({ kind: 'err', text: `cd: no such section: ${key}` });
      }
    };

    switch (cmd) {
      case 'help':
      case '?':
        HELP_LINES.forEach((l) => push({ kind: 'out', text: l }));
        return;
      case 'ls':
      case 'dir':
        LS_OUTPUT.forEach((l) => push({ kind: 'out', text: l }));
        return;
      case 'whoami':
        WHOAMI.forEach((l) => push({ kind: 'out', text: l }));
        return;
      case 'cd':
      case 'goto': {
        if (!arg) { push({ kind: 'err', text: 'usage: cd <section>' }); return; }
        goto(arg.toLowerCase().replace(/^\/+/, ''));
        return;
      }
      case 'about':
      case 'projects':
      case 'blogs':
      case 'achievements':
      case 'experience':
      case 'contact':
      case 'hero':
        goto(cmd);
        return;
      case 'home':
        goto('hero');
        return;
      case 'social': {
        const key = (arg || '').toLowerCase();
        const url = SOCIALS[key];
        if (!url) {
          push({ kind: 'err', text: `social: unknown — try: ${Object.keys(SOCIALS).join(', ')}` });
          return;
        }
        push({ kind: 'ok', text: `opening ${key} → ${url}` });
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      case 'resume':
      case 'cv':
        push({ kind: 'ok', text: `opening resume → ${RESUME_URL}` });
        window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
        return;
      case 'theme': {
        const name = (arg || '').toLowerCase();
        if (!name || !ACCENTS.includes(name)) {
          push({ kind: 'err', text: `theme: choose one of — ${ACCENTS.join(', ')}` });
          return;
        }
        if (name === 'default') {
          document.documentElement.removeAttribute('data-accent');
        } else {
          document.documentElement.setAttribute('data-accent', name);
        }
        try { localStorage.setItem('naman.accent', name); } catch { /* ignore */ }
        push({ kind: 'ok', text: `accent set: ${name}` });
        return;
      }
      case 'banner':
        push({ kind: 'banner' });
        return;
      case 'date':
        push({ kind: 'out', text: nowDate() });
        return;
      case 'echo':
        push({ kind: 'out', text: arg });
        return;
      case 'clear':
      case 'cls':
        reset();
        return;
      case 'exit':
      case ':q':
      case 'close':
        setOpen(false);
        return;
      // a couple of hidden easter eggs
      case 'sudo':
        push({ kind: 'err', text: 'permission denied: nice try ;)' });
        return;
      case 'rm':
        push({ kind: 'err', text: 'rm: refusing to remove the cosmos.' });
        return;
      case 'cowsay':
        push({ kind: 'out', text: ' ___________________\n< ' + (arg || 'moo') + ' >\n -------------------\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||' });
        return;
      case 'matrix':
        push({ kind: 'ok', text: 'wake up, neo... (try `theme emerald`)' });
        return;
      default:
        push({ kind: 'err', text: `command not found: ${cmd} — type \`help\`` });
    }
  }, [push, reset]);

  // Restore saved accent on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('naman.accent');
      if (saved && ACCENTS.includes(saved) && saved !== 'default') {
        document.documentElement.setAttribute('data-accent', saved);
      }
    } catch { /* ignore */ }
  }, []);

  // Global hotkeys
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const tag = t && t.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable);

      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (!open && !typing && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      // Ctrl+` to toggle from anywhere
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus input + autoscroll when opened or lines change
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines, open]);

  const onSubmit = (e) => {
    e.preventDefault();
    run(input);
    setInput('');
  };

  const onInputKey = (e) => {
    if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      reset();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0) return;
      if (histIdx === -1) return;
      const next = histIdx + 1;
      if (next >= history.length) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(next);
        setInput(history[next]);
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const all = [
        'help','ls','cd','whoami','about','projects','blogs','achievements',
        'experience','contact','hero','home','social','resume','theme',
        'banner','date','echo','clear','exit',
      ];
      const cur = input.trim();
      if (!cur.includes(' ')) {
        const matches = all.filter((c) => c.startsWith(cur));
        if (matches.length === 1) setInput(matches[0] + ' ');
        else if (matches.length > 1) push({ kind: 'mute', text: matches.join('  ') });
      }
    }
  };

  return (
    <>
      <button
        type="button"
        className="term-fab"
        aria-label="Open terminal"
        onClick={() => setOpen(true)}
      >
        <span className="blink-dot" aria-hidden="true" />
        <span>&gt;_ TERMINAL</span>
      </button>

      {open && (
        <div
          className="term-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="namanOS terminal"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="term-window" onMouseDown={(e) => e.stopPropagation()}>
            <div className="term-titlebar">
              <span className="term-dot r" />
              <span className="term-dot y" />
              <span className="term-dot g" />
              <span className="term-title">— namanOS · zsh —</span>
              <span className="term-esc">ESC</span>
            </div>
            <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
              {lines.map((entry, i) => (
                <Line key={i} entry={entry} />
              ))}
              <form onSubmit={onSubmit} className="term-inputline">
                <Prompt />
                <input
                  ref={inputRef}
                  className="term-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onInputKey}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  aria-label="terminal input"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
