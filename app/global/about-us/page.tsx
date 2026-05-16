'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Menu, X, ArrowRight, Globe2, Linkedin,
  MapPin, ChevronDown,
} from 'lucide-react'
import GlobalFooter from '../_components/GlobalFooter'
import CounterStats from '../_components/CounterStats'

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
   Data
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const VALUES = [
  {
    icon: '/About Us/Unlearn-To-Learn.png',
    title: 'Unlearn to Learn',
    desc: 'In a rapidly changing world, courageously step out of your comfort zone and let your convictions drive you to new heights.',
    accent: C.rose,
  },
  {
    icon: '/About Us/Respect.png',
    title: 'Respect',
    desc: 'In our hierarchy-less company, respect is fundamental for everyone, from the CEO to consultants and customers alike.',
    accent: C.coral,
  },
  {
    icon: '/About Us/Have-Fun.png',
    title: 'Have Fun',
    desc: "Amid life's intensity, remember to relax and enjoy the journey, fostering innovation, learning, and meaningful connections.",
    accent: C.gold,
  },
  {
    icon: '/About Us/Be-Bold.png',
    title: 'Be Bold',
    desc: 'Embrace new challenges with curiosity and leave behind limiting beliefs to start fresh and fearless in your pursuits.',
    accent: C.rose,
  },
  {
    icon: '/About Us/Ignite-Passion.png',
    title: 'Ignite Passion',
    desc: 'Embrace a bit of craziness and competitiveness to ignite passion in everything you do, driving innovation and excellence.',
    accent: C.coral,
  },
  {
    icon: '/About Us/Uphold-Integrity.png',
    title: 'Uphold Integrity',
    desc: 'Avoid shortcuts and politics; stay honest and upfront to build trust and play the long-term game.',
    accent: C.gold,
  },
  {
    icon: '/About Us/Lead.png',
    title: 'Lead',
    desc: 'Take ownership, inspire others, and drive meaningful change "” because leadership is a choice, not a title.',
    accent: C.rose,
  },
]

const PRINCIPLES = [
  {
    dash: '— Stay Relevant —',
    desc: 'To have an impact, we need to be cognizant of the world around us — from market trends to the challenges being faced.',
  },
  {
    dash: '— Be Authentic —',
    desc: 'Relationships are like pearls and deserve to be nurtured for all stakeholders, be it a customer or a colleague.',
  },
  {
    dash: '— Continuously Improve —',
    desc: 'There is no end to perfection and every mistake is a learning opportunity.',
  },
  {
    dash: '— Get Things Done —',
    desc: 'Walk the walk, not just talk the talk… and create outcomes and results through design and action.',
  },
]

const REGIONS = [
  {
    name: 'Middle East, Africa & Sub Continent',
    short: 'MEAS',
    emoji: 'ðŸŒ',
    count: 20,
    countries: [
      'Afghanistan','Algeria','Bahrain','Egypt','India','Iraq','Jordan',
      'Kazakhstan','Lebanon','Mauritius','Maldives','Nigeria','Oman',
      'Pakistan','Qatar','Rwanda','Saudi Arabia','South Africa','UAE','Uganda',
    ],
    accent: C.rose,
    glow: 'rgba(190,55,88,0.4)',
  },
  {
    name: 'Europe & North America',
    short: 'ENA',
    emoji: 'ðŸŒŽ',
    count: 14,
    countries: [
      'Austria','Belgium','Canada','Denmark','Finland','France','Germany',
      'Netherlands','Spain','Switzerland','Sweden','Turkey','UK','USA',
    ],
    accent: C.coral,
    glow: 'rgba(254,86,86,0.4)',
  },
  {
    name: 'Far East & Asia Pacific',
    short: 'FEAP',
    emoji: 'ðŸŒ',
    count: 9,
    countries: [
      'Australia','China','Hong Kong','Indonesia','Macau',
      'Malaysia','New Zealand','Singapore','Philippines',
    ],
    accent: C.gold,
    glow: 'rgba(254,219,153,0.4)',
  },
]

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
  const active = 'About Us'

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
   Hero
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '120px 5% 80px' }}>
      {/* Space photo background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img
          src="/About Us/photo_of_outer_space_edited_edited-removebg-preview.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Dark gradient overlays "” readable text, fades to site background at bottom */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(13,10,18,0.82) 0%, rgba(13,10,18,0.45) 60%, rgba(13,10,18,0.75) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: `linear-gradient(to bottom, transparent, ${C.dark})` }} />
      </div>

      {/* Rose glow behind text */}
      <div style={{ position: 'absolute', top: '20%', left: '3%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,55,88,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(190,55,88,0.18)', border: `1px solid rgba(190,55,88,0.35)`, marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
          <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>ABOUT US</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 76px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 28px', maxWidth: 820 }}>
          <span style={{ background: `linear-gradient(135deg, ${C.white} 0%, ${C.gold} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Through design, we enable<br />successful outcomes
          </span>
          <br />
          <span style={{ color: C.rose }}>and make a difference.</span>
        </h1>

        <p style={{ fontSize: 18, color: C.mauve, lineHeight: 1.8, maxWidth: 580, margin: '0 0 40px' }}>
          Global the Business Design Company is built on a core foundation of design "” creating, innovating, and delivering unique, outcome-focused solutions for companies and people since our inception.
        </p>

      </div>
    </section>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   About Section
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AboutSection() {
  return (
    <section style={{ padding: '80px 5%', background: C.dark }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(190,55,88,0.1)', border: '1px solid rgba(190,55,88,0.25)', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
              <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>WHO WE ARE</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: C.white, margin: '0 0 20px', letterSpacing: -0.5, lineHeight: 1.2 }}>
              The Business<br />
              <span style={{ background: `linear-gradient(90deg, ${C.rose}, ${C.coral})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Design Company</span>
            </h2>
            <p style={{ color: C.mauve, fontSize: 16, lineHeight: 1.85, margin: '0 0 18px' }}>
              Global the Business Design Company (Global) is built on a core foundation of design. Design enables us to create, innovate, prototype, get our hands dirty, and enjoy the process.
            </p>
            <p style={{ color: C.mauve, fontSize: 16, lineHeight: 1.85, margin: 0 }}>
              Since our inception, we have developed unique, outcome-focused solutions for companies and people — bridging vision with on-ground reality across 27 years and 27 countries.
            </p>
          </div>

          {/* Stats — animated counter on scroll */}
          <CounterStats />
          </div>
        </div>
      </div>
    </section>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Our Values
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function OurValues() {
  return (
    <section id="values" style={{ padding: '100px 5% 120px', background: `linear-gradient(180deg, ${C.dark} 0%, ${C.dark2} 100%)` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 50, background: 'rgba(190,55,88,0.1)', border: '1px solid rgba(190,55,88,0.25)', marginBottom: 22 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
            <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>OUR VALUES</span>
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 800, color: C.white, margin: '0 0 18px', letterSpacing: -0.5 }}>What We Stand For</h2>
          <p style={{ color: C.mauve, fontSize: 17, maxWidth: 480, margin: '0 auto', lineHeight: 1.75 }}>
            The principles that guide every decision, relationship, and outcome we create.
          </p>
        </div>

        {/* Row 1 "” 4 cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          {VALUES.slice(0, 4).map((v, i) => <ValueCard key={v.title} v={v} index={i} />)}
        </div>
        {/* Row 2 "” 3 cards centered */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          {VALUES.slice(4).map((v, i) => <ValueCard key={v.title} v={v} index={i + 4} />)}
        </div>
      </div>
    </section>
  )
}

function ValueCard({ v, index }: { v: (typeof VALUES)[number]; index: number }) {
  const [hov, setHov] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [shine, setShine] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)
    setTilt({ x: -dy * 10, y: dx * 10 })
    setShine({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  const handleMouseLeave = () => {
    setHov(false)
    setTilt({ x: 0, y: 0 })
    setShine({ x: 50, y: 50 })
  }

  return (
    <div style={{ perspective: '900px', width: 'clamp(220px, calc(25% - 15px), 268px)', flexShrink: 0, display: 'flex' }}>
      <div
        ref={cardRef}
        onMouseEnter={() => setHov(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background: 'rgba(22,15,32,0.85)',
          backdropFilter: 'blur(24px)',
          border: `1px solid ${hov ? v.accent + '60' : 'rgba(156,136,155,0.13)'}`,
          borderRadius: 22,
          padding: '34px 28px 30px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          width: '100%',
          minHeight: 260,
          transform: hov
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: hov
            ? 'transform 0.1s ease, box-shadow 0.2s ease, border-color 0.2s ease'
            : 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease',
          boxShadow: hov
            ? `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${v.accent}22, 0 0 48px ${v.accent}18`
            : '0 4px 24px rgba(0,0,0,0.35)',
        }}
      >
        {/* Top edge glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 2,
          background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)`,
          opacity: hov ? 1 : 0.3,
          transition: 'opacity 0.4s ease',
          borderRadius: '0 0 4px 4px',
        }} />

        {/* Specular shine "” follows cursor */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 22,
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,${hov ? '0.07' : '0'}) 0%, transparent 55%)`,
          transition: hov ? 'none' : 'background 0.5s ease',
        }} />

        {/* Bottom depth gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
          background: `linear-gradient(to top, ${v.accent}08, transparent)`,
          borderRadius: '0 0 22px 22px', pointerEvents: 'none',
        }} />

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: hov ? `${v.accent}18` : `${v.accent}08`,
          border: `1px solid ${v.accent}${hov ? '44' : '15'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 22,
          transition: 'all 0.35s ease',
          boxShadow: hov ? `0 0 28px ${v.accent}30, inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
          transform: hov ? 'translateZ(24px) scale(1.08)' : 'translateZ(0) scale(1)',
        }}>
          <img
            src={v.icon}
            alt={v.title}
            style={{ width: 38, height: 38, objectFit: 'contain' }}
          />
        </div>

        {/* Title */}
        <h3 style={{
          color: C.white, fontSize: 16, fontWeight: 700, margin: '0 0 11px', letterSpacing: 0.2,
          transform: hov ? 'translateZ(16px)' : 'translateZ(0)',
          transition: 'transform 0.35s ease',
        }}>
          {v.title}
        </h3>

        {/* Description */}
        <p style={{
          color: hov ? 'rgba(156,136,155,0.95)' : C.mauve,
          fontSize: 13.5, lineHeight: 1.78, margin: 0,
          transform: hov ? 'translateZ(10px)' : 'translateZ(0)',
          transition: 'transform 0.35s ease, color 0.3s ease',
        }}>
          {v.desc}
        </p>
      </div>
    </div>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Our Approach
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function OurApproach() {
  return (
    <section style={{ padding: '100px 5%', background: C.dark }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(190,55,88,0.1)', border: '1px solid rgba(190,55,88,0.25)', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
            <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>OUR APPROACH</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 800, color: C.white, margin: '0 0 16px', letterSpacing: -0.5 }}>How We Work</h2>
          <p style={{ color: C.mauve, fontSize: 17, maxWidth: 680, margin: '0 auto', lineHeight: 1.8 }}>
            Over the last 27 years, we have developed a unique method of delivering 'touch and feel' measurable results for clients — shaped by our guiding principles and philosophy.
          </p>
        </div>

        {/* Guiding Principles */}
        <div style={{ marginBottom: 80 }}>
          <h3 style={{ color: C.gold, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 36 }}>Guiding Principles</h3>
          <p style={{ color: C.mauve, fontSize: 15, lineHeight: 1.8, textAlign: 'center', maxWidth: 620, margin: '0 auto 40px', }}>
            Our guiding principles were shaped to bridge our values into our day-to-day operations at a deeper level. They are simple and practical tenants of our work.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {PRINCIPLES.map((p, i) => (
              <div key={i} style={{ background: C.card, backdropFilter: 'blur(12px)', border: '1px solid rgba(156,136,155,0.15)', borderRadius: 16, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.rose}, ${C.coral})` }} />
                <p style={{ color: C.rose, fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: '0 0 12px' }}>{p.dash}</p>
                <p style={{ color: C.mauve, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3E Philosophy */}
        <div style={{ background: 'rgba(190,55,88,0.06)', border: '1px solid rgba(190,55,88,0.15)', borderRadius: 24, padding: '52px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(190,55,88,0.15)', border: '1px solid rgba(190,55,88,0.3)', marginBottom: 16 }}>
              <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>OUR PHILOSOPHY</span>
            </div>
            <h3 style={{ color: C.white, fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>Global 3E Philosophy</h3>
            <p style={{ color: C.mauve, fontSize: 15, maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              How we have maintained an 85% repeat/referral-based clientele "” by going deep, not broad.
            </p>
          </div>

          {/* 3E Triangle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
            {[
              { label: 'EXACT\nChallenge', sub: 'Identify the root cause\nor vision with precision', step: '01', accent: C.gold },
              { label: 'EXACT\nSolution',  sub: 'Design a custom solution\ntailored to the need',    step: '02', accent: C.coral },
              { label: 'EXACT\nOutcome',   sub: 'Achieve the precise result\nyour organisation needs', step: '03', accent: C.rose },
            ].map((e, i) => (
              <div key={e.step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '28px 24px', background: `${e.accent}0f`, border: `1px solid ${e.accent}33`, borderRadius: 18, minWidth: 180, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: e.accent, color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1, padding: '3px 10px', borderRadius: 20 }}>{e.step}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: e.accent, marginBottom: 8, whiteSpace: 'pre-line', lineHeight: 1.2 }}>{e.label}</div>
                  <div style={{ color: C.mauve, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{e.sub}</div>
                </div>
                {i < 2 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: C.mauve, fontSize: 22, fontWeight: 300 }}>→</div>
                )}
              </div>
            ))}
          </div>

          <p style={{ color: C.mauve, fontSize: 15, lineHeight: 1.85, maxWidth: 720, margin: '40px auto 0', textAlign: 'center' }}>
            Global does not believe in creating bandage solutions or using standard models to resolve our client's needs. We deep dive to find the root cause and/or the vision then customise what is needed to guarantee outcomes.
          </p>
        </div>
      </div>
    </section>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Our Presence "” Interactive Map Section
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

// Pin positions on map (% of image)
const PIN_POSITIONS = [
  { left: '57%', top: '44%' }, // MEAS
  { left: '32%', top: '28%' }, // ENA
  { left: '78%', top: '42%' }, // FEAP
]


function OurPresence() {
  const [activeRegion, setActiveRegion] = useState<number | null>(null)
  const [visibleCountries, setVisibleCountries] = useState<boolean[]>([])

  const selectRegion = (i: number) => {
    if (activeRegion === i) {
      setActiveRegion(null); setVisibleCountries([]); return
    }
    setActiveRegion(i); setVisibleCountries([])
    REGIONS[i].countries.forEach((_, ci) => {
      setTimeout(() => {
        setVisibleCountries(prev => { const n = [...prev]; n[ci] = true; return n })
      }, ci * 60)
    })
  }

  const region = activeRegion !== null ? REGIONS[activeRegion] : null

  return (
    <section id="presence" style={{ background: C.dark, padding: '100px 5% 80px' }}>
      <style>{`
        @keyframes ping {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
          70%  { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(190,55,88,0.1)', border: '1px solid rgba(190,55,88,0.25)', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
            <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>OUR PRESENCE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, color: C.white, margin: '0 0 16px', letterSpacing: -0.5 }}>A Global Footprint</h2>
          <p style={{ color: C.mauve, fontSize: 17, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Active across 3 regions and 43 countries. Click a pin to explore.
          </p>
        </div>

        {/* â”€â”€ Map â”€â”€ */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 1100, margin: '0 auto 40px', userSelect: 'none', borderRadius: 20 }}>

          {/* Map image */}
          <img
            src="/About Us/Our_Presence-removebg-preview.png"
            alt="Global presence map"
            style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.88 }}
          />

          {/* Region glow overlays */}
          {activeRegion !== null && (
            <div style={{
              position: 'absolute',
              left: PIN_POSITIONS[activeRegion].left,
              top: PIN_POSITIONS[activeRegion].top,
              transform: 'translate(-50%, -50%)',
              width: 320, height: 320,
              background: `radial-gradient(circle, ${REGIONS[activeRegion].accent}28 0%, transparent 68%)`,
              borderRadius: '50%',
              pointerEvents: 'none',
              transition: 'all 0.5s ease',
            }} />
          )}

          {/* Pins */}
          {REGIONS.map((r, i) => {
            const pos = PIN_POSITIONS[i]
            const isActive = activeRegion === i
            return (
              <div
                key={r.name}
                onClick={() => selectRegion(i)}
                style={{ position: 'absolute', left: pos.left, top: pos.top, cursor: 'pointer', zIndex: 20 }}
              >
                {/* Ping rings */}
                {[0, 0.7].map((delay, di) => (
                  <div key={di} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 18, height: 18, borderRadius: '50%',
                    background: r.accent + (isActive ? 'aa' : '44'),
                    animation: 'ping 2.2s cubic-bezier(0,0,0.2,1) infinite',
                    animationDelay: `${i * 0.35 + delay}s`,
                  }} />
                ))}
                {/* Dot */}
                <div style={{
                  position: 'relative', zIndex: 2,
                  width: isActive ? 18 : 13, height: isActive ? 18 : 13,
                  borderRadius: '50%',
                  background: isActive ? r.accent : C.dark,
                  border: `2.5px solid ${r.accent}`,
                  boxShadow: isActive ? `0 0 22px ${r.glow}, 0 0 6px ${r.accent}` : `0 0 8px ${r.accent}77`,
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'translate(-2px, -2px)' : 'none',
                }} />
                {/* Tooltip */}
                <div style={{
                  position: 'absolute', bottom: '160%', left: '50%', transform: 'translateX(-50%)',
                  background: isActive ? r.accent : 'rgba(13,10,18,0.95)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${r.accent}88`,
                  color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: isActive ? `0 4px 18px ${r.glow}` : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {r.short} Â· {r.count} countries
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `4px solid ${isActive ? r.accent : 'rgba(13,10,18,0.95)'}` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
          {REGIONS.map((r, i) => (
            <button key={r.name} onClick={() => selectRegion(i)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 50,
              background: activeRegion === i ? `${r.accent}22` : 'rgba(51,42,63,0.4)',
              border: `1px solid ${activeRegion === i ? r.accent + '77' : 'rgba(156,136,155,0.2)'}`,
              color: activeRegion === i ? C.white : C.mauve,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: activeRegion === i ? `0 0 20px ${r.glow}` : 'none',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.accent }} />
              {r.name}
              <span style={{ color: r.accent, fontWeight: 800 }}>{r.count}</span>
            </button>
          ))}
        </div>

        {/* Country tags panel */}
        {region && (
          <div style={{
            background: 'rgba(26,18,37,0.9)', backdropFilter: 'blur(24px)',
            border: `1px solid ${region.accent}44`, borderRadius: 24, padding: '32px 36px',
            boxShadow: `0 0 60px ${region.glow}, 0 16px 48px rgba(0,0,0,0.4)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 24 }}>{region.emoji}</span>
              <h3 style={{ color: C.white, fontSize: 17, fontWeight: 700, margin: 0 }}>{region.name}</h3>
              <div style={{ marginLeft: 'auto', background: `${region.accent}22`, border: `1px solid ${region.accent}44`, color: region.accent, fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20 }}>
                {region.count} Countries
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {region.countries.map((country, ci) => (
                <div key={country} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 50,
                  background: visibleCountries[ci] ? `${region.accent}18` : 'transparent',
                  border: `1px solid ${visibleCountries[ci] ? region.accent + '55' : 'transparent'}`,
                  color: visibleCountries[ci] ? C.white : 'transparent',
                  fontSize: 13, fontWeight: 500,
                  transition: 'all 0.35s ease',
                  transform: visibleCountries[ci] ? 'translateY(0)' : 'translateY(10px)',
                  opacity: visibleCountries[ci] ? 1 : 0,
                }}>
                  <MapPin size={10} color={region.accent} />
                  {country}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Footer
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Page
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AboutUsPage() {
  return (
    <main style={{ background: C.dark, color: C.white, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Nav />
      <Hero />
      <AboutSection />
      <OurValues />
      <OurApproach />
      <OurPresence />
      <GlobalFooter />
    </main>
  )
}




