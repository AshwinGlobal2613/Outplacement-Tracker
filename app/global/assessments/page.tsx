'use client'

import { useState, useEffect } from 'react'
import GlobalFooter from '../_components/GlobalFooter'
import { Menu, X, Globe2, Linkedin } from 'lucide-react'

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Brand tokens
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const C = {
  dark:  '#0d0a12',
  dark2: '#1a1225',
  card:  'rgba(51,42,63,0.55)',
  rose:  '#be3758',
  coral: '#fe5656',
  mauve: '#9c889b',
  gold:  '#fedb99',
  white: '#f5f3f7',
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Nav
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Home',         href: '/global' },
    { label: 'Capabilities', href: '/global/capabilities' },
    { label: 'About Us',     href: '/global/about-us' },
    { label: 'Assessments',  href: '/global/assessments' },
    { label: 'Contact',      href: '/global/contact' },
  ]
  const active = 'Assessments'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(13,10,18,0.92)' : 'rgba(13,10,18,0.6)',
      backdropFilter: 'blur(18px)',
      borderBottom: scrolled ? '1px solid rgba(190,55,88,0.15)' : '1px solid rgba(156,136,155,0.08)',
      transition: 'all 0.4s ease', padding: '0 5%',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <a href="/global" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/2021%20Logo%20-%20White%20Text.png" alt="Global Management Consultant" style={{ height: 90, objectFit: 'contain' }} />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden md:flex">
          {links.map(({ label, href }) => {
            const isActive = label === active
            return (
              <a key={label} href={href} style={{ color: isActive ? C.rose : C.mauve, fontSize: 14, fontWeight: 500, textDecoration: 'none', letterSpacing: 1, transition: 'color 0.2s', borderBottom: isActive ? `2px solid ${C.rose}` : '2px solid transparent', paddingBottom: 2 }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = isActive ? C.rose : C.mauve)}
              >{label.toUpperCase()}</a>
            )
          })}
          <a href="/global/contact" style={{ padding: '10px 24px', borderRadius: 50, background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: 1, boxShadow: `0 4px 20px rgba(190,55,88,0.4)`, transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(190,55,88,0.55)` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(190,55,88,0.4)` }}
          >GET IN TOUCH</a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.white }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div style={{ background: 'rgba(13,10,18,0.98)', backdropFilter: 'blur(20px)', padding: '24px 5%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {links.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setOpen(false)} style={{ color: C.white, textDecoration: 'none', fontSize: 16, fontWeight: 500, letterSpacing: 1 }}>{label}</a>
          ))}
        </div>
      )}
    </nav>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Capability Diagram â€” exact from PPTX
   Positions scaled: 12192000 EMU â†’ 1200 px
   All Y values shifted â€“120 to crop top space
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CY_SPINE = 197   // circles centre-line (317 â€“ 120)
const LH       = 16    // label line-height (px)

const PPTX_CIRCLES = [
  // cx  r    label lines                          above  lcx   ly
  { cx: 148,  r: 43,  lines: ['Leadership'],                  above: true,  lcx: 153,  ly: 56  },
  { cx: 220,  r: 53,  lines: ['Strategy'],                    above: false, lcx: 218,  ly: 301 },
  { cx: 337,  r: 92,  lines: ['Change Management'],           above: true,  lcx: 335,  ly: 39  },
  { cx: 450,  r: 54,  lines: ['Culture for All'],             above: false, lcx: 449,  ly: 294 },
  { cx: 545,  r: 76,  lines: ['Engagement'],                  above: true,  lcx: 545,  ly: 56  },
  { cx: 688,  r: 103, lines: ['High Performance', 'Teams'],   above: false, lcx: 688,  ly: 331 },
  { cx: 847,  r: 87,  lines: ['Diagnostics &', 'Problem Solving'], above: true, lcx: 847, ly: 23 },
  { cx: 954,  r: 46,  lines: ['Stakeholder', 'Experience'],   above: false, lcx: 955,  ly: 302 },
  { cx: 1019, r: 32,  lines: ['Communication'],               above: true,  lcx: 1019, ly: 82  },
  { cx: 1086, r: 50,  lines: ['Talent', 'Lifecycle'],         above: false, lcx: 1086, ly: 275 },
]

function CapabilityBubbles() {
  const [active, setActive] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      width: '100%', overflowX: 'auto',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.9s ease, transform 0.9s ease',
    }}>
      <style>{`
        @keyframes bubblePop {
          0%   { opacity:0; transform:scale(0.3); }
          70%  { opacity:1; transform:scale(1.05); }
          100% { opacity:1; transform:scale(1); }
        }
      `}</style>

      <svg viewBox="0 0 1200 390" width="100%" style={{ minWidth: 720, display: 'block' }}>
        <defs>
          {PPTX_CIRCLES.map((_, i) => (
            <radialGradient key={i} id={`rg${i}`} cx="50%" cy="50%" r="50%">
              {/* Matches PPTX: centre 8 % â†’ mid 19 % â†’ edge 56 % opacity of #FE5656 */}
              <stop offset="0%"   stopColor="#FE5656" stopOpacity={active === i ? 0.22 : 0.08} />
              <stop offset="50%"  stopColor="#FE5656" stopOpacity={active === i ? 0.42 : 0.19} />
              <stop offset="100%" stopColor="#FE5656" stopOpacity={active === i ? 0.82 : 0.56} />
            </radialGradient>
          ))}
        </defs>

        {/* Horizontal spine â€” accent1 coral, full width */}
        <line x1={76} y1={CY_SPINE} x2={1164} y2={CY_SPINE}
          stroke="rgba(254,86,86,0.38)" strokeWidth="1.5" />

        {PPTX_CIRCLES.map((c, i) => {
          const isAct = active === i
          const { above, lines, lcx, ly, cx, r } = c
          const labelH = lines.length * LH

          // connector runs between label edge and circle edge
          const connY1 = above ? ly + labelH + 5      : CY_SPINE + r + 3
          const connY2 = above ? CY_SPINE - r - 3     : ly - 5

          return (
            <g key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Soft outer halo on hover */}
              {isAct && (
                <circle cx={cx} cy={CY_SPINE} r={r + 18}
                  fill="rgba(254,86,86,0.07)" />
              )}

              {/* Main circle â€” PPTX radial gradient */}
              <circle cx={cx} cy={CY_SPINE} r={r}
                fill={`url(#rg${i})`}
                style={{
                  animation: mounted ? `bubblePop 0.5s ease ${i * 0.06}s both` : 'none',
                }}
              />

              {/* Outer stroke ring */}
              <circle cx={cx} cy={CY_SPINE} r={r}
                fill="none"
                stroke={isAct ? 'rgba(254,86,86,0.72)' : 'rgba(254,86,86,0.32)'}
                strokeWidth={isAct ? 1.3 : 0.8}
                style={{ transition: 'stroke 0.25s, stroke-width 0.25s' }}
              />

              {/* Centre dot */}
              <circle cx={cx} cy={CY_SPINE} r={isAct ? 4 : 2.5}
                fill={isAct ? '#FF8080' : 'rgba(254,86,86,0.65)'}
                style={{ transition: 'r 0.2s, fill 0.2s' }}
              />

              {/* Vertical connector */}
              <line x1={cx} y1={connY1} x2={cx} y2={connY2}
                stroke={isAct ? 'rgba(254,86,86,0.52)' : 'rgba(254,86,86,0.25)'}
                strokeWidth={isAct ? 1.2 : 0.8}
                style={{ transition: 'stroke 0.2s' }}
              />

              {/* Label text â€” scales up on hover, anchored to group centre */}
              <g style={{
                transform: isAct ? 'scale(1.18)' : 'scale(1)',
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transition: 'transform 0.22s ease',
              }}>
                {lines.map((line, li) => (
                  <text key={li}
                    x={lcx}
                    y={ly + li * LH + 13}
                    textAnchor="middle"
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      fill: isAct ? '#FEDB99' : 'rgba(245,243,247,0.82)',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '0.4px',
                      transition: 'fill 0.22s',
                      pointerEvents: 'none',
                    }}
                  >{line}</text>
                ))}
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Five Behaviors Pyramid
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const FIVE_LAYERS = [
  {
    key: 'results',
    label: 'RESULTS',
    highlight: 'Results',
    title: 'Focus on Achieving Collective Results',
    desc: "The ultimate goal is the achievement of results, unlocked through implementing the model's principles of Trust, Conflict, Commitment, and Accountability.",
  },
  {
    key: 'accountability',
    label: 'ACCOUNTABILITY',
    highlight: 'Accountable',
    title: 'Hold One Another Accountable',
    desc: 'Once everyone is committed to a clear plan of action, they will be more willing to hold one another accountable.',
  },
  {
    key: 'commitment',
    label: 'COMMITMENT',
    highlight: 'Commit',
    title: 'Commit to Decisions',
    desc: 'When team members are able to offer opinions and debate ideas, they feel heard and respected, and will be more likely to commit to decisions.',
  },
  {
    key: 'conflict',
    label: 'CONFLICT',
    highlight: 'Conflict',
    title: 'Engage in Conflict Around Ideas',
    desc: 'With trust, team members are able to engage in unfiltered, constructive debate of ideas.',
  },
  {
    key: 'trust',
    label: 'TRUST',
    highlight: 'Trust',
    title: 'Trust One Another',
    desc: 'When team members are genuinely transparent and honest with one another, it forms a safe environment that creates and builds vulnerability-based trust.',
  },
]

/* Split a title string around a highlight word */
function HighlightTitle({ title, word }: { title: string; word: string }) {
  const idx = title.indexOf(word)
  if (idx === -1) return <>{title}</>
  return (
    <>
      {title.slice(0, idx)}
      <span style={{ color: C.coral }}>{word}</span>
      {title.slice(idx + word.length)}
    </>
  )
}

function FiveBehaviorsPyramid() {
  const [active, setActive] = useState<string | null>(null)

  const PH = 500, PW = 500
  const LAYERS_GEO = [
    { key: 'results',        y1: 0,   y2: 100 },
    { key: 'accountability', y1: 100, y2: 200 },
    { key: 'commitment',     y1: 200, y2: 300 },
    { key: 'conflict',       y1: 300, y2: 400 },
    { key: 'trust',          y1: 400, y2: 500 },
  ]

  const xL = (y: number) => (250 * (PH - y)) / PH
  const xR = (y: number) => PW - (250 * (PH - y)) / PH
  const pts = (y1: number, y2: number) =>
    y1 === 0
      ? `250,0 ${xR(y2)},${y2} ${xL(y2)},${y2}`
      : `${xL(y1)},${y1} ${xR(y1)},${y1} ${xR(y2)},${y2} ${xL(y2)},${y2}`

  // viewBox "0 -10 500 515" => total vb height = 525, offset = 10
  const PYR_W   = 589
  const VB_H    = 525
  const VB_OFF  = 10
  const PYR_H   = Math.round(PYR_W * VB_H / 500)   // 462 px

  // Convert a SVG y-coordinate to rendered pixels from the top of the SVG element
  const toRendY = (svgY: number) => Math.round((svgY + VB_OFF) / VB_H * PYR_H)

  // Centre Y of each layer in SVG coords (layers are 100 px each: 50,150,250,350,450)
  const LAYER_SVG_CY = [50, 150, 250, 350, 450]

  return (
    <div style={{ display: 'flex', gap: 44, alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* ── LEFT: two cards, height = pyramid ── */}
      <div style={{
        flex: '0 0 275px',
        height: PYR_H,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {[
          {
            accent: 'linear-gradient(90deg,#be3758,#fe5656)',
            body: "Give your team the skills required to work effectively as a unit in an ever-evolving workplace. Activate your team’s ability to drive results through The Five Behaviors®’s Personal Development or Team Development solutions, combining decades of research and key personalized insights.",
          },
          {
            accent: 'linear-gradient(90deg,#fe5656,#be3758)',
            body: "The Five Behaviors® programs are powerful, unique, and impactful team development solutions that empower thought innovation, shape new behaviors and create a common language geared towards impact and results.",
          },
        ].map((c, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '22px 24px',
            background: 'rgba(51,42,63,0.38)',
            borderRadius: 16,
            border: '1px solid rgba(190,55,88,0.12)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ width: 30, height: 3, background: c.accent, borderRadius: 2, marginBottom: 14, flexShrink: 0 }} />
            <p style={{ color: '#9c889b', fontSize: 13, lineHeight: 1.85, margin: 0 }}>{c.body}</p>
          </div>
        ))}
      </div>

      {/* ── CENTER: pyramid ── */}
      <div style={{ flex: 1, minWidth: 320, display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 -10 500 515"
          style={{
            display: 'block',
            width: PYR_W,
            filter: 'drop-shadow(0 24px 64px rgba(190,55,88,0.55))',
          }}
        >
          <defs>
            <linearGradient id="pyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#e83055" />
              <stop offset="100%" stopColor="#a81630" />
            </linearGradient>
          </defs>

          {LAYERS_GEO.map(({ key, y1, y2 }) => {
            const data  = FIVE_LAYERS.find(l => l.key === key)!
            const isAct = active === key
            const textY = y1 + (y2 - y1) * (key === 'results' ? 0.72 : 0.5)
            return (
              <g key={key}
                onMouseEnter={() => setActive(key)}
                onMouseLeave={() => setActive(null)}
                style={{ cursor: 'pointer' }}
              >
                <polygon points={pts(y1, y2)} fill="url(#pyG)" />
                <polygon points={pts(y1, y2)} fill="rgba(245,240,255,0.22)"
                  style={{ opacity: isAct ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                {y1 > 0 && (
                  <line x1={xL(y1)} y1={y1} x2={xR(y1)} y2={y1}
                    stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                )}
                <text x={250} y={textY} textAnchor="middle"
                  style={{
                    fontSize: 12.5, fontWeight: 800, letterSpacing: '2px',
                    dominantBaseline: 'middle',
                    fill: '#fff', fontFamily: 'Inter, sans-serif',
                    pointerEvents: 'none', userSelect: 'none',
                  }}
                >
                  {data.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* ── RIGHT: titles evenly distributed across pyramid height ── */}
      <style>{`
        @keyframes descIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        flex: '0 0 235px',
        height: PYR_H,
        display: 'grid',
        gridTemplateRows: 'repeat(5, 1fr)',
      }}>
        {FIVE_LAYERS.map((layer) => {
          const isAct = active === layer.key
          return (
            <div
              key={layer.key}
              onMouseEnter={() => setActive(layer.key)}
              onMouseLeave={() => setActive(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: 16,
                borderLeft: `2px solid ${isAct ? '#be3758' : 'rgba(190,55,88,0.2)'}`,
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
              }}
            >
              <p style={{
                color: isAct ? '#f5f3f7' : 'rgba(245,243,247,0.65)',
                fontSize: 13.5, fontWeight: 600,
                margin: 0, lineHeight: 1.3,
                transition: 'color 0.2s ease',
                whiteSpace: 'normal',
              }}>
                <HighlightTitle title={layer.title} word={layer.highlight} />
              </p>
              {isAct && (
                <p style={{
                  color: 'rgba(156,136,155,0.88)',
                  fontSize: 12, lineHeight: 1.65,
                  margin: '6px 0 0',
                  animation: 'descIn 0.22s ease',
                }}>
                  {layer.desc}
                </p>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Footer
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Page
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AssessmentsPage() {
  return (
    <main style={{ background: C.dark, color: C.white, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes discFadeIn {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <Nav />

      {/* â”€â”€ Hero â”€â”€ */}
      <section style={{ padding: '140px 5% 80px', background: `linear-gradient(180deg, ${C.dark2} 0%, ${C.dark} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,55,88,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 50, background: 'rgba(190,55,88,0.18)', border: '1px solid rgba(190,55,88,0.35)', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
            <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>ASSESSMENTS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 24px' }}>
            <span style={{ background: `linear-gradient(135deg, ${C.white} 0%, ${C.gold} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Unlock Human Potential
            </span>
            <br />
            <span style={{ color: C.rose }}>Through Insight</span>
          </h1>
          <p style={{ color: C.mauve, fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            World-class assessment tools to help individuals and teams better understand themselves, communicate effectively, and achieve collective results.
          </p>
        </div>
      </section>

      {/* â”€â”€ Everything DiSC â”€â”€ */}
      <section style={{ padding: '80px 5% 100px', background: C.dark }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Badge + headline â€” side by side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 72, marginBottom: 64, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Logo */}
            <div style={{ flexShrink: 0 }}>
              <img
                src="/Assessments/ED_AuthorizedPartner_Badge_WhiteBlue@2x.png"
                alt="Everything DiSC Authorized Partner"
                style={{ width: 260, objectFit: 'contain', display: 'block' }}
              />
            </div>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 280, maxWidth: 680 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(190,55,88,0.1)', border: '1px solid rgba(190,55,88,0.25)', marginBottom: 22 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
                <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>EVERYTHING DiSC</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 50px)', fontWeight: 800, color: C.white, margin: '0 0 20px', letterSpacing: -0.5, lineHeight: 1.15 }}>
                Unlock the potential of people and the{' '}
                <span style={{ background: `linear-gradient(90deg, ${C.rose}, ${C.coral})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>power of culture</span>
              </h2>
              <p style={{ color: C.mauve, fontSize: 17, lineHeight: 1.9, margin: 0 }}>
                With over 40 years of research-backed expertise, Everything DiSCÂ® is the ultimate personal development and assessment platform. Measure your preferences and tendencies using the DiSC model today.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(190,55,88,0.2), transparent)`, margin: '0 auto 64px', maxWidth: 600 }} />

          {/* Deepen understanding */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h3 style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', fontWeight: 700, color: C.white, margin: '0 0 18px', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.3 }}>
              Deepen your understanding of yourself, your team and others.
            </h3>
            <p style={{ color: C.mauve, fontSize: 16, maxWidth: 840, margin: '0 auto', lineHeight: 1.9 }}>
              Make workplace interactions more effective and enjoyable with the help of Everything DiSCÂ®'s powerful assessment tools. With the help of personalized insights for every participant, DiSC is the ideal catalyst to spark culture improvement in any organization across the following areas:
            </p>
          </div>

          {/* Capability Bubbles */}
          <CapabilityBubbles />
        </div>
      </section>

      {/* Section divider */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(190,55,88,0.25), transparent)`, margin: '0 5%' }} />

      {/* â”€â”€ Five Behaviors â”€â”€ */}
      <section style={{ padding: '100px 5% 120px', background: `linear-gradient(180deg, ${C.dark} 0%, ${C.dark2} 100%)` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Badge + headline â€” side by side (mirrors DiSC section) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 72, marginBottom: 72, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Logo */}
            <div style={{ flexShrink: 0 }}>
              <img
                src="/Assessments/5B_Badge_AuthorizedPartnerRedWhite@2x.png"
                alt="Five Behaviors Authorized Partner"
                style={{ width: 260, objectFit: 'contain', display: 'block' }}
              />
            </div>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 280, maxWidth: 680 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(190,55,88,0.1)', border: '1px solid rgba(190,55,88,0.25)', marginBottom: 22 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
                <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>FIVE BEHAVIORS</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 50px)', fontWeight: 800, color: C.white, margin: '0 0 20px', letterSpacing: -0.5, lineHeight: 1.15 }}>
                Activate your team&apos;s{' '}
                <span style={{ background: `linear-gradient(90deg, ${C.rose}, ${C.coral})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>potential!</span>
              </h2>
              <p style={{ color: C.mauve, fontSize: 17, lineHeight: 1.9, margin: 0 }}>
                As we continue to feel the effects of COVID-19 in the workplace, engage and educate your teams remotely through Catalyst; a personalized, online learning platform that integrates DiSC into the workflow seamlessly.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(190,55,88,0.2), transparent)`, margin: '0 auto 64px', maxWidth: 600 }} />

          {/* Heading */}
          <h3 style={{ fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 700, color: '#f5f3f7', margin: '0 0 40px', lineHeight: 1.35 }}>
            Through the Five Behaviors, participants learn to:
          </h3>

          <FiveBehaviorsPyramid />
        </div>
      </section>

      <GlobalFooter />
    </main>
  )
}




