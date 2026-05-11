'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Menu, X, ArrowRight, Globe2, Linkedin,
  TrendingUp, Users, Zap, Award, Check,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Custom SVG icons (Three C's)
───────────────────────────────────────────── */

/* Capacity — three people, solid fill, verified badge */
function CapacityIcon({ size = 28, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 88" fill={color}>
      {/* Left person — head */}
      <circle cx="19" cy="26" r="12" />
      {/* Left person — body */}
      <path d="M0 62 Q1 44 19 44 Q28 44 33 51 L33 62 Z" />

      {/* Right person — head */}
      <circle cx="81" cy="26" r="12" />
      {/* Right person — body */}
      <path d="M100 62 Q99 44 81 44 Q72 44 67 51 L67 62 Z" />

      {/* Centre person — head (larger, in front) */}
      <circle cx="50" cy="21" r="16" />
      {/* Centre person — body */}
      <path d="M18 64 Q18 46 50 46 Q82 46 82 64 Z" />

      {/* Badge circle */}
      <circle cx="50" cy="73" r="17" />
      {/* Checkmark — white cutout */}
      <path
        d="M41 73 L47.5 80 L62 64"
        stroke="white" strokeWidth="5"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/* Creativity — paint palette + diagonal brush, outline */
function CreativityIcon({ size = 28, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      {/*
        Palette: organic kidney/palette shape — wide lower-left,
        concave notch on upper-right where thumb hole sits.
      */}
      <path d="
        M 46 14
        C 64 10, 84 22, 86 42
        C 88 58, 80 72, 67 78
        C 61 81, 55 78, 53 73
        C 51 68, 54 62, 51 58
        C 48 55, 42 57, 38 62
        C 30 72, 18 70, 12 58
        C 6  44, 12 26, 26 18
        C 33 13, 40 15, 46 14 Z
      " />
      {/* Thumb hole — upper right area */}
      <circle cx="67" cy="31" r="7.5" />
      {/* Three paint colour circles on left face */}
      <circle cx="34" cy="42" r="6" />
      <circle cx="44" cy="57" r="6" />
      <circle cx="34" cy="66" r="6" />
      {/* Brush handle — diagonal lower-left → upper-right */}
      <line x1="12" y1="92" x2="74" y2="18" />
      {/* Ferrule — thick band near tip */}
      <path d="M69 23 L77 13" strokeWidth="6.5" strokeLinecap="round" />
      {/* Bristle tip — small filled triangle */}
      <path d="M74 18 L82 8 L76 14 Z" fill={color} stroke="none" />
    </svg>
  )
}

/* Capability — raised fist inside hub-and-spoke ring, outline */
function CapabilityIcon({ size = 28, color = 'currentColor' }: { size?: number; color?: string }) {
  const cx = 50, cy = 46, r = 25
  // 7 evenly-spaced spokes (-90° = top, clockwise)
  const angles = Array.from({ length: 7 }, (_, i) => -90 + i * (360 / 7))
  const spokes = angles.map(deg => {
    const rad = (deg * Math.PI) / 180
    return {
      x1: cx + Math.cos(rad) * r,
      y1: cy + Math.sin(rad) * r,
      x2: cx + Math.cos(rad) * (r + 13),
      y2: cy + Math.sin(rad) * (r + 13),
      nx: cx + Math.cos(rad) * (r + 18),
      ny: cy + Math.sin(rad) * (r + 18),
    }
  })

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">

      {/* Hub ring */}
      <circle cx={cx} cy={cy} r={r} />

      {/* Spokes + hollow terminal nodes */}
      {spokes.map((s, i) => (
        <g key={i}>
          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          <circle cx={s.nx} cy={s.ny} r="4" fill="none" stroke={color} strokeWidth="2.5" />
        </g>
      ))}

      {/* ── Raised fist ── */}
      {/*
        Single closed outline: 4 knuckle bumps across the top,
        straight sides, curved palm at bottom.
      */}
      <path d="
        M 33 46
        L 33 38 Q 33 31 38 31 Q 43 31 43 38
        Q 43 27 48 27 Q 53 27 53 34
        Q 53 29 57 29 Q 62 29 62 36
        Q 62 32 65 33 Q 69 34 69 40
        L 69 46
        Q 69 60 51 62
        Q 33 60 33 46 Z
      " />
      {/* Thumb — protrudes left */}
      <path d="M 33 50 Q 28 48 26 52 Q 25 57 28 60 Q 31 62 33 60" />
      {/* Knuckle dividers (finger crease lines) */}
      <line x1="43" y1="34" x2="43" y2="46" />
      <line x1="53" y1="32" x2="53" y2="46" />
      <line x1="62" y1="34" x2="62" y2="46" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Brand tokens
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const THREE_CS = [
  {
    title: 'Capacity',
    desc: 'The support on special or new projects beyond the ongoing workload, where the knowledge or resources are missing.',
    icon: '/icons/Capacity logo.png',
    accent: C.rose,
    glow: 'rgba(190,55,88,0.2)',
  },
  {
    title: 'Creativity',
    desc: 'The ability to innovate, think outside the box, and offer independent and objective support.',
    icon: '/icons/creativity logo.png',
    accent: C.coral,
    glow: 'rgba(254,86,86,0.2)',
  },
  {
    title: 'Capability',
    desc: 'The need to access highly-specialized skills on a short or long-term basis.',
    icon: '/icons/capability logo.png',
    accent: C.gold,
    glow: 'rgba(254,219,153,0.15)',
  },
]

const SERVICES = [
  {
    Icon: TrendingUp,
    title: 'Strategy & Transformation',
    tagline: 'Connecting the vision to on-ground reality to pave the way and achieve it.',
    desc: 'Global revitalizes organizations to be future-ready, agile, and relevant to the market needs. Crafting the direction and building the structures in order for any organization to move forward towards their goals.',
    items: [
      'Business Planning & Strategy',
      'Change & Project Management',
      'Operational & Quality Excellence',
      'Market Research & Entry',
    ],
    accent: C.rose,
    glow: 'rgba(190,55,88,0.18)',
  },
  {
    Icon: Users,
    title: 'Talent & Culture',
    tagline: 'Nurturing a values-based culture to engage, motivate, and grow people.',
    desc: 'Successful business is powered through the heart of the organization, the people. We ensure the talents are uplifted to perform through creating a rich culture and holistic talent experience, regardless of being home, off-site, or in the office.',
    items: [
      'Culture & People Based Interventions',
      'Talent Lifecycle & Journey Mapping',
      'Talent Management & Development',
      'Individual & Team Profiling',
    ],
    accent: C.coral,
    glow: 'rgba(254,86,86,0.18)',
  },
  {
    Icon: Zap,
    title: 'Special Projects',
    tagline: 'Beyond our core business, where there is a track record and a capable team.',
    desc: "With our team's collective experience spanning multiple industries, skill sets, and backgrounds, we are capable and delighted to work on unique and personalized projects centered on what your needs are.",
    items: [
      'B2B Matchmaking & Channel Management',
      'Marketing & Branding',
      'CX3: Customer Experience, Expectation, Excellence',
      'And more…',
    ],
    accent: C.gold,
    glow: 'rgba(254,219,153,0.12)',
  },
  {
    Icon: Award,
    title: 'Assessments',
    tagline: 'Authorized Partners of powerful profiling tools; used by millions of people across the world.',
    desc: 'Using tools backed by science and research, Everything DiSC and the Five Behaviors are culture catalysts. They come with actionable insights where any individual, team, or organization is given the tools and knowledge to shape their workforce for the better.',
    items: [
      'Everything DiSC® — Individual profiling across leadership, management, sales, and EQ, with comparisons and online tools',
      'The Five Behaviors® — Team profiling and diagnostics, built with Patrick Lencioni, author of the Five Dysfunctions of a Team',
    ],
    accent: C.mauve,
    glow: 'rgba(156,136,155,0.18)',
    logos: [
      '/partners/ED_AuthorizedPartner_Badge_WhiteBlue@2x.png',
      '/partners/5B_Badge_AuthorizedPartnerRedWhite@2x.png',
    ],
  },
]

const CLIENTS: { industry: string; clients: string[] }[] = [
  {
    industry: 'Finance & Insurance',
    clients: ['ABN Amro Bank', 'Abu Dhabi Commercial Bank', 'Acumen Consulting', 'AIG', 'Al Fardan', 'Al Hilal Bank', 'Bank of Punjab'],
  },
  {
    industry: 'Health Care',
    clients: ['Al Noor', 'Carestream', 'Dar ul Shifa Hospitals', 'Eli Lilly', 'J&J', 'Pfizer'],
  },
  {
    industry: 'Technology',
    clients: ['Oracle', 'Acer', 'Cisco', 'Microsoft', 'Fono Nokia', 'Autodesk', 'Siemens'],
  },
  {
    industry: 'Real Estate & Development',
    clients: ['Alec Construction', 'Asteco', 'Damac Group', 'Indigo Developers', 'Rao Holdings', 'Seeb'],
  },
  {
    industry: 'Aviation',
    clients: ['Air Maldives', 'Airport de Paris', 'Arabian Adventures', 'Emirates Airlines', 'Oman Air', 'Safi Airways', 'Sea Wings'],
  },
  {
    industry: 'Retail & Apparel',
    clients: ['Adidas', 'Aldo', 'Dune', 'Giordano', 'Gasoline Clothing', 'Virgin'],
  },
  {
    industry: 'Industrial & Manufacturing',
    clients: ['ASM International', 'Descon', 'Dutco', 'Evonik', 'Ecopest', 'Fauji Fertilizer'],
  },
  {
    industry: 'Education',
    clients: ['Middlesex University', 'Sommet Education', 'Sufi Foundation', 'University of Wollongong', 'University of Prince Sultan (PSU)', 'Zayed University'],
  },
  {
    industry: 'Energy',
    clients: ['GE', 'Shell', 'Elite Ikon', 'Dolphin Energy', 'Petronas', 'BP', 'Bilfinger Tebodin'],
  },
  {
    industry: 'Marketing & Media',
    clients: ['APCO Worldwide', 'BBC News', 'Brainchild Group', 'Content Factory', 'KEO Events', 'MAD Group', 'MCI Group'],
  },
  {
    industry: 'Hospitality',
    clients: ['Chedi Muscat', 'Hyatt Hotels', "InterContinental's", 'Jebel Ali Hotel', 'Jumeirah Group', 'Nabila Hair Beauty Spa'],
  },
  {
    industry: 'Telecom',
    clients: ['Du', 'Etisalat', 'Eutelsat', 'Fono Nokia', 'i2 Itisalat', 'Jazz'],
  },
  {
    industry: 'Professional Services',
    clients: ['Asdaa Group', 'Ernst & Young', 'KPMG', 'Genpact', 'Manpower Group', 'Xponential Group'],
  },
  {
    industry: 'Consumer Goods',
    clients: ['Coca-Cola', 'Fine Tissues & Hygiene', 'Friesland Campina', 'Hassani Group & Supermarkets', 'Henkel', 'Pepsi'],
  },
  {
    industry: 'Logistics & Auto',
    clients: ['Agility Logistics', 'Atlas Honda', 'Audi', 'Audi Volkswagen', 'Dubai Ports & Customs', 'MAX Logistics', 'Indus Motors'],
  },
  {
    industry: 'Public & Third Sector',
    clients: ['Abu Dhabi Chamber of Commerce & Industry', 'Abu Dhabi Dept. of Economic Development', 'American Business Council Pakistan', 'British Council', 'Dubai Economic Department'],
  },
]

/* ─────────────────────────────────────────────
   Nav
───────────────────────────────────────────── */
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
    { label: 'Contact',      href: '/global#contact' },
  ]
  const active = 'Capabilities'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(13,10,18,0.92)' : 'rgba(13,10,18,0.6)',
      backdropFilter: 'blur(18px)',
      borderBottom: scrolled ? '1px solid rgba(190,55,88,0.15)' : '1px solid rgba(156,136,155,0.08)',
      transition: 'all 0.4s ease',
      padding: '0 5%',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <a href="/global" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px rgba(190,55,88,0.5)`,
          }}>
            <Globe2 size={18} color="#fff" />
          </div>
          <span style={{
            fontWeight: 800, fontSize: 20, letterSpacing: 3,
            background: `linear-gradient(90deg, ${C.white}, ${C.gold})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>GLOBAL</span>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden md:flex">
          {links.map(({ label, href }) => {
            const isActive = label === active
            return (
              <a
                key={label}
                href={href}
                style={{
                  color: isActive ? C.rose : C.mauve,
                  fontSize: 14, fontWeight: 500,
                  textDecoration: 'none', letterSpacing: 1,
                  transition: 'color 0.2s',
                  borderBottom: isActive ? `2px solid ${C.rose}` : '2px solid transparent',
                  paddingBottom: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = isActive ? C.rose : C.mauve)}
              >
                {label.toUpperCase()}
              </a>
            )
          })}
          <a
            href="/global#contact"
            style={{
              padding: '10px 24px', borderRadius: 50,
              background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
              color: '#fff', fontSize: 13, fontWeight: 700,
              textDecoration: 'none', letterSpacing: 1,
              boxShadow: `0 4px 20px rgba(190,55,88,0.4)`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 8px 28px rgba(190,55,88,0.55)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 4px 20px rgba(190,55,88,0.4)`
            }}
          >
            GET IN TOUCH
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.white }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'rgba(13,10,18,0.98)', backdropFilter: 'blur(20px)',
          padding: '24px 5%', display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{ color: C.white, textDecoration: 'none', fontSize: 16, fontWeight: 500, letterSpacing: 1 }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

/* ─────────────────────────────────────────────
   Hero — Grow With Us
───────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '70vh',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
      padding: '120px 5% 80px',
    }}>
      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/Capabilities/IMG-20210121-WA0005-1-2..png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.25)',
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(13,10,18,0.85) 0%, rgba(190,55,88,0.15) 50%, rgba(13,10,18,0.9) 100%)`,
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '20%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(190,55,88,0.2) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        {/* Label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 50,
          background: 'rgba(190,55,88,0.15)',
          border: `1px solid rgba(190,55,88,0.3)`,
          marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
          <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>OUR CAPABILITIES</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(42px, 6vw, 80px)',
          fontWeight: 800, lineHeight: 1.1,
          margin: '0 0 24px',
          background: `linear-gradient(135deg, ${C.white} 0%, ${C.gold} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          maxWidth: 760,
        }}>
          Grow With Us
        </h1>

        <p style={{
          fontSize: 18, color: C.mauve, lineHeight: 1.75,
          maxWidth: 620, margin: '0 0 20px',
        }}>
          Global's added value is best explained by our customers. The reasons they have repeatedly cited for working with us:
        </p>

        {/* Three C cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20, marginTop: 52, maxWidth: 860,
        }}>
          {THREE_CS.map(({ title, desc, icon, accent, glow }) => (
            <div key={title} style={{
              background: C.card,
              backdropFilter: 'blur(16px)',
              border: `1px solid ${accent}33`,
              borderRadius: 16,
              padding: '28px 24px',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: `0 4px 24px ${glow}`,
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 36px ${glow}`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${glow}`
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `${accent}22`,
                border: `1px solid ${accent}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <img src={icon} alt={title} style={{ width: 36, height: 36, objectFit: 'contain' }} />
              </div>
              <h3 style={{ color: C.white, fontSize: 18, fontWeight: 700, margin: '0 0 10px', letterSpacing: 0.5 }}>{title}</h3>
              <p style={{ color: C.mauve, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Service card
───────────────────────────────────────────── */
function ServiceCard({ s, index }: { s: typeof SERVICES[number]; index: number }) {
  const [hov, setHov] = useState(false)
  const isEven = index % 2 === 0

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? `linear-gradient(135deg, rgba(51,42,63,0.8), rgba(51,42,63,0.4))`
          : C.card,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hov ? s.accent + '55' : 'rgba(156,136,155,0.15)'}`,
        borderRadius: 20,
        padding: '40px 40px 36px',
        transition: 'all 0.35s ease',
        boxShadow: hov ? `0 16px 48px ${s.glow}` : '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: `${s.accent}1a`,
          border: `1px solid ${s.accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.3s',
          ...(hov ? { background: `${s.accent}33` } : {}),
        }}>
          <s.Icon size={24} color={s.accent} />
        </div>
        <div>
          <h3 style={{
            color: C.white, fontSize: 22, fontWeight: 700,
            margin: '0 0 6px', letterSpacing: 0.3,
          }}>{s.title}</h3>
          <p style={{ color: s.accent, fontSize: 14, fontWeight: 500, margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
            {s.tagline}
          </p>
        </div>
      </div>

      {/* Description */}
      <p style={{ color: C.mauve, fontSize: 15, lineHeight: 1.8, margin: '0 0 24px' }}>
        {s.desc}
      </p>

      {/* Service items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {s.items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: `${s.accent}22`,
              border: `1px solid ${s.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
            }}>
              <Check size={11} color={s.accent} strokeWidth={2.5} />
            </div>
            <span style={{ color: C.white, fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Assessment logos */}
      {'logos' in s && s.logos && (
        <div style={{ marginBottom: 28 }}>
          {/* Label */}
          <p style={{
            color: C.mauve, fontSize: 11, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', margin: '0 0 14px',
          }}>Authorized Partner</p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {s.logos.map((src, li) => (
              <div key={src} style={{
                position: 'relative',
                flex: '1 1 180px',
                minHeight: 130,
                borderRadius: 14,
                overflow: 'hidden',
                background: li === 0
                  ? 'linear-gradient(135deg, #0a2a4a 0%, #0d3b6e 100%)'
                  : 'linear-gradient(135deg, #1a0a10 0%, #3a0d1e 100%)',
                border: `1px solid ${li === 0 ? 'rgba(59,130,246,0.35)' : 'rgba(190,55,88,0.35)'}`,
                boxShadow: li === 0
                  ? '0 4px 24px rgba(59,130,246,0.15)'
                  : '0 4px 24px rgba(190,55,88,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px 20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = li === 0
                    ? '0 10px 32px rgba(59,130,246,0.28)'
                    : '0 10px 32px rgba(190,55,88,0.28)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = li === 0
                    ? '0 4px 24px rgba(59,130,246,0.15)'
                    : '0 4px 24px rgba(190,55,88,0.15)'
                }}
              >
                {/* Subtle corner glow */}
                <div style={{
                  position: 'absolute', bottom: -20, right: -20,
                  width: 80, height: 80, borderRadius: '50%',
                  background: li === 0
                    ? 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(190,55,88,0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <img
                  src={src}
                  alt=""
                  style={{
                    width: 'auto', height: 'auto',
                    maxHeight: 90, maxWidth: '100%',
                    objectFit: 'contain', display: 'block',
                    position: 'relative',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <a
          href="/global#contact"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 24px', borderRadius: 50,
            background: hov
              ? `linear-gradient(135deg, ${s.accent}, ${s.accent}cc)`
              : 'transparent',
            border: `1px solid ${s.accent}66`,
            color: hov ? '#fff' : s.accent,
            fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
        >
          LEARN MORE <ArrowRight size={14} />
        </a>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   What We Do
───────────────────────────────────────────── */
function WhatWeDo() {
  return (
    <section style={{ padding: '100px 5%', background: C.dark }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 50,
            background: 'rgba(190,55,88,0.1)',
            border: '1px solid rgba(190,55,88,0.25)',
            marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
            <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>WHAT WE DO</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800, color: C.white,
            margin: '0 0 16px', letterSpacing: -0.5,
          }}>
            Our Services
          </h2>
          <p style={{ color: C.mauve, fontSize: 17, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Four interconnected pillars that drive transformation across every dimension of your organisation.
          </p>
        </div>

        {/* 2×2 grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: 28,
        }}>
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} s={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Our Clients
───────────────────────────────────────────── */
function OurClients() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section style={{
      padding: '100px 5%',
      background: `linear-gradient(180deg, ${C.dark} 0%, ${C.dark2} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        width: 800, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(190,55,88,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(32px) scale(0.94); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0);   }
        }
        @keyframes shimmerSweep {
          0%   { left: -100%; }
          100% { left: 200%;  }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.8); opacity: 0.6; }
        }
      `}</style>

      <div ref={sectionRef} style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 50,
            background: 'rgba(190,55,88,0.1)',
            border: '1px solid rgba(190,55,88,0.25)',
            marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
            <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>OUR CLIENTS</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800, color: C.white,
            margin: '0 0 16px', letterSpacing: -0.5,
          }}>
            220+ Happy Customers
          </h2>
          <p style={{ color: C.mauve, fontSize: 17, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Here is a snapshot of the organisations we have had the privilege of working with.
          </p>
        </div>

        {/* Industry grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {CLIENTS.map(({ industry, clients }, i) => (
            <IndustryCard
              key={industry}
              industry={industry}
              clients={clients}
              index={i}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function IndustryCard({
  industry, clients, index, visible,
}: {
  industry: string; clients: string[]; index: number; visible: boolean
}) {
  const [hov, setHov] = useState(false)
  // diagonal stagger: cards further right+down appear later
  const cols = 4
  const col = index % cols
  const row = Math.floor(index / cols)
  const delay = (col * 60 + row * 90)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        background: hov ? 'rgba(51,42,63,0.75)' : 'rgba(51,42,63,0.35)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${hov ? 'rgba(190,55,88,0.4)' : 'rgba(156,136,155,0.12)'}`,
        borderRadius: 16,
        padding: '24px 22px',
        overflow: 'hidden',
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        boxShadow: hov ? '0 12px 40px rgba(190,55,88,0.15)' : 'none',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        opacity: visible ? 1 : 0,
        animation: visible
          ? `cardReveal 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`
          : 'none',
      }}
    >
      {/* Shimmer sweep on hover */}
      {hov && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: '60%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          animation: 'shimmerSweep 0.7s ease forwards',
          pointerEvents: 'none',
        }} />
      )}

      {/* Industry header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 16, paddingBottom: 14,
        borderBottom: `1px solid ${hov ? 'rgba(190,55,88,0.3)' : 'rgba(156,136,155,0.12)'}`,
        transition: 'border-color 0.3s',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
          animation: hov ? 'dotPulse 1s ease-in-out infinite' : 'none',
        }} />
        <h4 style={{
          color: hov ? C.white : C.gold,
          fontSize: 13, fontWeight: 700, margin: 0,
          letterSpacing: 0.8, transition: 'color 0.3s',
          textTransform: 'uppercase',
        }}>{industry}</h4>
      </div>

      {/* Client list */}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {clients.map((c, ci) => (
          <li key={c} style={{
            color: hov ? C.white : C.mauve,
            fontSize: 13, lineHeight: 1.5,
            paddingLeft: 12, position: 'relative',
            transition: `color 0.2s ease ${ci * 30}ms`,
          }}>
            <span style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              width: 4, height: 4, borderRadius: '50%',
              background: C.rose, opacity: hov ? 0.9 : 0.45,
              transition: 'opacity 0.3s',
            }} />
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      padding: '52px 5% 32px',
      background: '#080610',
      borderTop: '1px solid rgba(156,136,155,0.12)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe2 size={18} color="#fff" />
            </div>
            <span style={{
              fontWeight: 800, fontSize: 18, letterSpacing: 3,
              background: `linear-gradient(90deg, ${C.white}, ${C.gold})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>GLOBAL</span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Home', href: '/global' },
              { label: 'Capabilities', href: '/global/capabilities' },
              { label: 'About Us', href: '/global/about-us' },
              { label: 'Assessments', href: '/global/assessments' },
              { label: 'Contact', href: '/global#contact' },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{
                color: C.mauve, fontSize: 13, textDecoration: 'none', fontWeight: 500,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = C.mauve)}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="#" style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(51,42,63,0.6)',
              border: '1px solid rgba(156,136,155,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.mauve, textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.rose
                e.currentTarget.style.color = C.white
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(156,136,155,0.2)'
                e.currentTarget.style.color = C.mauve
              }}
            >
              <Linkedin size={16} />
            </a>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(156,136,155,0.1)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: C.mauve, fontSize: 13, margin: 0, opacity: 0.6 }}>
            © {new Date().getFullYear()} Global Management Consultant. All rights reserved.
          </p>
          <p style={{ color: C.mauve, fontSize: 13, margin: 0, opacity: 0.6 }}>
            The Business Design Company
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function CapabilitiesPage() {
  return (
    <main style={{
      background: C.dark,
      color: C.white,
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <Nav />
      <Hero />
      <WhatWeDo />
      <OurClients />
      <Footer />
    </main>
  )
}
