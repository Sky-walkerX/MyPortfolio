import { SectionHead } from "./Prompt";
import { PaletteButton } from "./PaletteButton";
import { ProjectDetailsButton } from "./ProjectDetailsButton";
import {
  ACHIEVEMENTS,
  BLOGS,
  EXPERIENCES,
  HACKATHONS,
  PROJECTS,
  SKILLS,
} from "@/lib/data";
import { SITE } from "@/lib/site";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58C20.56 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const ExternalIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export function About() {
  return (
    <section id="about">
      <SectionHead
        cmd={
          <>
            cat <span className="arg">~/about.md</span>
          </>
        }
        num="[01]"
      />

      <div className="about-body r">
        <p>
          I&apos;m a developer who lives in the space between <strong>web</strong> and <strong>systems</strong> —
          building things end-to-end, from React frontends down to Go services orchestrated over NATS.
        </p>
        <p>
          Right now I&apos;m interning with <strong>Formstr</strong> as part of Summer of Bitcoin, working on a
          unified super-app for forms, notes, calendar and files — with{" "}
          <span style={{ color: "var(--fg-1)" }}>35+ PRs</span> shipped across the core repos.
        </p>
        <p>
          Outside of internships, I do competitive programming (CF Specialist, 4★ CodeChef), CTFs (Rank{" "}
          <span style={{ color: "var(--fg-1)" }}>146</span> at Google CTF), and contribute to OSS projects like{" "}
          <span style={{ color: "var(--fg-1)" }}>tauri</span>,{" "}
          <span style={{ color: "var(--fg-1)" }}>fedimint</span>, and{" "}
          <span style={{ color: "var(--fg-1)" }}>Checkmate</span>.
        </p>
      </div>

      <div className="block r">
        <span className="block-title">
          <span className="acc">~/</span>.id
        </span>
        <div className="kv-list">
          <span className="k">name</span>
          <span className="v">Naman Khandelwal</span>
          <span className="k">school</span>
          <span className="v">IIIT Lucknow · B.Tech CS · 2024 – 2028</span>
          <span className="k">gpa</span>
          <span className="v">8.90 / 10</span>
          <span className="k">github</span>
          <span className="v">
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              {SITE.githubHandle}
            </a>
          </span>
          <span className="k">linkedin</span>
          <span className="v">
            <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
              Naman Khandelwal
            </a>
          </span>
          <span className="k">email</span>
          <span className="v">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </span>
          <span className="k">site</span>
          <span className="v">
            <a href={SITE.url} target="_blank" rel="noopener noreferrer">
              namankhandelwal.me
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience">
      <SectionHead
        cmd={
          <>
            ./experience.sh <span className="flag">--list</span>
          </>
        }
        num="[02]"
      />

      {EXPERIENCES.map((e, i) => (
        <div className="exp-entry r" key={i}>
          <div className="exp-head">
            <span className="tree-line">{e.branch}</span>
            <span className="exp-role">{e.role}</span>
            <span className="tree-line">@</span>
            <span className="exp-co">{e.company}</span>
            <span className="exp-date">{e.date}</span>
          </div>
          <ul className="exp-bullets">
            {e.bullets.map((b, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: b }} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function Projects() {
  return (
    <section id="work">
      <SectionHead
        cmd={
          <>
            ls <span className="flag">-la</span> <span className="arg">~/projects/</span>
          </>
        }
        num="[04]"
      />

      <div className="proj-grid">
        {PROJECTS.map((p) => (
          <article className="proj r" key={p.name}>
            <div className="proj-head">
              <span className="proj-num">{p.num}</span>
              <h3 className="proj-name">{p.name}</h3>
              <span className={`proj-status${p.status === "live" ? "" : ` ${p.status}`}`}>{p.status}</span>
            </div>
            <p className="proj-desc">{p.description}</p>
            <ul className="proj-bullets">
              {p.bullets.map((b, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
            <div className="proj-foot">
              <div className="proj-tags">
                {p.tags.map((t) => (
                  <span className="t" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="proj-links">
                <ProjectDetailsButton project={p} />
                {p.links.live && (
                  <a href={p.links.live} target="_blank" rel="noopener noreferrer" aria-label="View live">
                    <ExternalIcon />
                    live
                  </a>
                )}
                <a href={p.links.source} target="_blank" rel="noopener noreferrer" aria-label="Source code">
                  <GithubIcon />
                  source
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p style={{ color: "var(--fg-4)", fontSize: 12, margin: "18px 0 0" }}>
        # tip: tap <span style={{ color: "var(--accent)" }}>deep-dive</span> on any project for
        architecture + system design, or type <span style={{ color: "var(--accent)" }}>view trequila</span> in
        the terminal.
      </p>
    </section>
  );
}

export function Hackathons() {
  return (
    <section id="hackathons">
      <SectionHead
        cmd={
          <>
            cat <span className="arg">~/hackathons.log</span>
          </>
        }
        num="[05]"
      />

      <div className="hack-grid r">
        {HACKATHONS.map((h, i) => (
          <div className={`hack${h.placeholder ? " placeholder" : ""}`} key={i}>
            <span className="medal">{h.medal}</span>
            <div className="body">
              <span className="name" style={h.placeholder ? { color: "var(--fg-2)" } : undefined}>
                {h.name}
              </span>
              <span className="sub" dangerouslySetInnerHTML={{ __html: h.sub }} />
            </div>
            <span className="date">{h.date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Skills() {
  return (
    <section id="skills">
      <SectionHead
        cmd={
          <>
            cat <span className="arg">~/.stack/*.conf</span>
          </>
        }
        num="[06]"
      />

      <div className="skills r">
        {SKILLS.map((row) => (
          <div className="sg-line" key={row.key}>
            <span className="sg-key">{row.key}</span>
            <span className="sg-vals">
              {row.values.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </span>
          </div>
        ))}
      </div>

      <div className="line section-head" style={{ marginTop: 36 }}>
        <span className="prompt">
          <span className="u">naman</span>
          <span className="c">@</span>
          <span className="h">portfolio</span>
          <span className="c">:</span>
          <span className="p">~</span>
          <span className="d">$</span>
        </span>
        <span className="cmd">
          grep <span className="arg">&quot;achievement&quot;</span>{" "}
          <span className="arg">history.log</span>
        </span>
      </div>
      <div className="section-rule" />

      <ul className="ach r">
        {ACHIEVEMENTS.map((a, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: a }} />
        ))}
      </ul>
    </section>
  );
}

export function Blogs() {
  return (
    <section id="blogs">
      <SectionHead
        cmd={
          <>
            ls <span className="arg">~/blogs/</span>
          </>
        }
        num="[07]"
      />

      <div className="blog-grid r">
        {BLOGS.map((b, i) => (
          <a className="blog" href={b.href} target="_blank" rel="noopener noreferrer" key={i}>
            <span className="meta">{b.meta}</span>
            <h3 className="title">{b.title}</h3>
            <p className="desc">{b.description}</p>
            <div className="tags">
              {b.tags.map((t) => (
                <span className="t" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <span className="read">read more</span>
          </a>
        ))}
      </div>
      <p style={{ color: "var(--fg-4)", fontSize: 12, margin: "18px 0 0" }}>
        # full archive at{" "}
        <a href={SITE.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
          namankhandelwal.me
        </a>
      </p>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact">
      <SectionHead cmd={<>./contact.sh</>} num="[08]" />

      <div className="about-body r" style={{ marginBottom: 16 }}>
        <p>
          Open to <strong>internships</strong>, <strong>collabs</strong>, and interesting conversations. I read
          every message — usually reply within a day.
        </p>
      </div>

      <div className="contact-grid r">
        <div className="contact-row">
          <span className="k">email ›</span>
          <span className="v">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </span>
        </div>
        <div className="contact-row">
          <span className="k">github ›</span>
          <span className="v">
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              github.com/{SITE.githubHandle}
            </a>
          </span>
        </div>
        <div className="contact-row">
          <span className="k">linkedin ›</span>
          <span className="v">
            <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
              in/naman-khandelwal
            </a>
          </span>
        </div>
        <div className="contact-row">
          <span className="k">site ›</span>
          <span className="v">
            <a href={SITE.url} target="_blank" rel="noopener noreferrer">
              namankhandelwal.me
            </a>
          </span>
        </div>
        <div className="contact-row">
          <span className="k">resume ›</span>
          <span className="v">
            <a href={SITE.resumePath} target="_blank" rel="noopener noreferrer">
              Naman_Khandelwal_Resume.pdf
            </a>
          </span>
        </div>
      </div>

      <div className="btn-row r" style={{ marginTop: 18 }}>
        <a href={`mailto:${SITE.email}`} className="cli-btn primary">
          <span className="glyph">✉</span> send email
        </a>
        <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="cli-btn">
          <span className="glyph">↗</span> open github
        </a>
        <a href={SITE.resumePath} target="_blank" rel="noopener noreferrer" className="cli-btn">
          <span className="glyph">▤</span> download resume
        </a>
        <PaletteButton>
          <span className="glyph">⌘</span> run command
        </PaletteButton>
      </div>
    </section>
  );
}
