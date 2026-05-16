'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  TrendingUp,
  Star,
  Users,
  Menu,
  X,
  ArrowRight,
  Globe2,
  Mail,
  MapPin,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Quote,
} from 'lucide-react'
import GlobalFooter from './_components/GlobalFooter'

/* ─────────────────────────────────────────────
   Brand tokens
───────────────────────────────────────────── */
const C = {
  dark:   '#0d0a12',
  dark2:  '#1a1225',
  card:   'rgba(51,42,63,0.55)',
  rose:   '#be3758',
  coral:  '#fe5656',
  mauve:  '#9c889b',
  gold:   '#fedb99',
  white:  '#f5f3f7',
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const SERVICES = [
  {
    Icon: TrendingUp,
    title: 'Strategy & Transformation',
    description: 'Connecting the vision on ground reality to pave the way to achieve it.',
    accent: C.rose,
    glow: 'rgba(190,55,88,0.25)',
  },
  {
    Icon: Star,
    title: 'Special Projects & Events',
    description: 'Additional services where there is success and repeated requests.',
    accent: C.coral,
    glow: 'rgba(254,86,86,0.25)',
  },
  {
    Icon: Users,
    title: 'Talent, Culture & HR',
    description: 'A culture where people are engaged, motivated and productive.',
    accent: C.gold,
    glow: 'rgba(254,219,153,0.2)',
  },
]

const STATS = [
  { value: 27, suffix: '',  label: 'Countries Reached' },
  { value: 26, suffix: '+', label: 'Unique Industries Served' },
  { value: 40, suffix: '+', label: 'Global Partners' },
  { value: 85, suffix: '%', label: 'Referrals & Repeat Clients' },
  { value: 25, suffix: '+', label: 'Expert Consultants' },
]

const LEADERS = [
  {
    name: 'Shayan Azhar',
    title: 'Managing Partner',
    bio: 'A seasoned Managing Partner with cross-functional expertise, a sustainability advocate, and a psychologist. She progressed from Junior Consultant to driving business verticals, caring for clients, and fostering community success.',
    image: '/team/shayan.jpg',
    imagePosition: '50% 5%',
    linkedin: 'https://www.linkedin.com/in/shayanazhar?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B2BTBIFA5RJmcQuaUKmoWkw%3D%3D',
  },
  {
    name: 'Saira Akbar',
    title: 'Founder',
    bio: 'Saira is a visionary and transformative leader with a global perspective who can help businesses overcome challenges and succeed. She is also a skilled leadership developer and a trusted advisor.',
    image: '/team/saira.jpg',
    imagePosition: '50% 5%',
    linkedin: 'https://www.linkedin.com/in/sairaakbar?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BDrfNfV5%2FSAyTnBg32RYjUA%3D%3D',
  },
  {
    name: 'Mahreen Qazi',
    title: 'Managing Partner',
    bio: 'A skilled leader with a passion for business growth. She builds strong relationships, fosters collaboration, and drives results — a creative thinker and problem solver for complex challenges.',
    image: '/team/mahreen.jpg',
    imagePosition: '50% 5%',
    linkedin: 'https://www.linkedin.com/in/mahreenqazi?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B3pyjF1lgQT6ssHT2BNSK2Q%3D%3D',
  },
]

const TESTIMONIALS = [
  {
    quote: 'The breakout sessions were very engaging and really supported the content well by providing an opportunity to exercise the learnings. The facilitator from Global was an outstanding leader and really helped to push me in the directions needed to ensure the skills were comprehended and practiced. Their engaging style is very relaxing, yet effective!',
    company: 'ASMPT',
    logo: '/partners/image (39).png',
  },
  {
    quote: "It's amazing working with your team. I know that when something's going wrong, and I see Shayan or one of the Global team members there, I can relax. I think, 'It's ok, Global will handle it.' It's always such a pleasure having you here.",
    company: 'ADCB Group',
    logo: '/partners/image_edited.png',
  },
  {
    quote: "Global has truly surpassed all my expectations. I'm so pleased with the outcomes and results of our session. I'm sure the others have learnt a lot and will remember this going forward. You made a difference for sure!",
    company: 'UNICEF',
    logo: '/partners/image (40).png',
  },
  {
    quote: 'This team is fabulous. I keep going back to them, even having moved countries and companies, and I refer others to them. I know they will support me in real time while giving me all the tools, experts, and resources I need to take my strategy forward.',
    company: 'Breitling',
    logo: '/partners/image (41).png',
  },
  {
    quote: "I'd like to personally thank everyone, from the project leader to all support members, for making this a great experience. Your passion allowed us to complete this project, despite the many challenges. You took it into stride — and it's been a pleasure to witness.",
    company: 'Abu Dhabi Early Childhood Authority',
    logo: '/partners/download-removebg-preview.png',
  },
  {
    quote: 'The LDP came to life as a result of your continued commitment to getting this ground-breaking program off the ground. Each step of the way has demonstrated the value the attendees have felt — expressed through their feedback not only on paper but also from their personal stories.',
    company: 'MCI Group',
    logo: '/partners/image (3) (1).png',
  },
]

/* ─────────────────────────────────────────────
   Hooks
───────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = (e.target as HTMLElement).dataset.delay ?? '0'
            ;(e.target as HTMLElement).style.animationDelay = `${delay}s`
            e.target.classList.add('gs-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => {
      ;(el as HTMLElement).style.opacity = '0'
      io.observe(el)
    })
    return () => io.disconnect()
  }, [])
}

function useCounter(target: number, triggered: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!triggered) return
    let start = 0
    const duration = 1800
    const step = 16
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, step)
    return () => clearInterval(timer)
  }, [target, triggered])
  return count
}

function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - 0.5) * 22
      const y = ((e.clientY - r.top) / r.height - 0.5) * -22
      el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.03,1.03,1.03)`
    }
    const onLeave = () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])
}

/* ─────────────────────────────────────────────
   Navbar
───────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
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
  const active = 'Home'

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(13,10,18,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(190,55,88,0.15)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 5%',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <a href="/global" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/2021%20Logo%20-%20White%20Text.png" alt="Global Management Consultant" style={{ height: 90, objectFit: 'contain' }} />
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
            href="/global/contact"
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
   Orbital Rings element
───────────────────────────────────────────── */
function OrbitalRings() {
  const S = 400 // container size

  const dot = (color: string, glow: string, animName: string, size = 10): React.CSSProperties => ({
    position: 'absolute', top: -size / 2, left: '50%',
    transform: 'translateX(-50%)',
    width: size, height: size, borderRadius: '50%',
    background: color,
    animation: `${animName} 2.4s ease-in-out infinite`,
  })

  return (
    <div className="hidden lg:block gs-float-slow" style={{ perspective: 1100, perspectiveOrigin: '50% 50%' }}>
      <div style={{
        width: S, height: S, position: 'relative',
        transformStyle: 'preserve-3d',
        animation: 'gs-orbit-y 28s linear infinite',
      }}>

        {/* Aura glow behind sphere */}
        <div className="gs-pulse-glow" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 210, height: 210, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(190,55,88,0.35), transparent 70%)`,
          filter: 'blur(22px)',
        }} />

        {/* Ring A — widest, near-horizontal */}
        <div style={{
          position: 'absolute', inset: 10,
          border: '1.5px solid rgba(190,55,88,0.55)',
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
          animation: 'gs-ring-spin-a 7s linear infinite',
        }}>
          <div style={dot(C.rose, C.rose, 'gs-orb-glow-a', 11)} />
        </div>

        {/* Ring B — mid, angled */}
        <div style={{
          position: 'absolute', inset: 30,
          border: '1.5px solid rgba(254,86,86,0.45)',
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
          animation: 'gs-ring-spin-b 11s linear infinite',
        }}>
          <div style={dot(C.coral, C.coral, 'gs-orb-glow-b', 9)} />
        </div>

        {/* Ring C — innermost, steeply tilted */}
        <div style={{
          position: 'absolute', inset: 52,
          border: '1.5px solid rgba(254,219,153,0.35)',
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
          animation: 'gs-ring-spin-c 15s linear infinite',
        }}>
          <div style={{
            ...dot(C.gold, C.gold, 'gs-orb-glow-b', 7),
            background: C.gold,
          }} />
        </div>

        {/* Central glowing sphere */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 115, height: 115, borderRadius: '50%',
          background: `radial-gradient(circle at 36% 36%, ${C.coral}, ${C.rose} 55%, #5a0b22)`,
          animation: 'gs-sphere-breathe 4s ease-in-out infinite',
        }} />

        {/* Inner highlight */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-38%, -42%)',
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          filter: 'blur(5px)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Hero Section
───────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse 120% 80% at 60% 0%, rgba(190,55,88,0.18) 0%, transparent 60%),
                     radial-gradient(ellipse 80% 60% at 0% 100%, rgba(254,86,86,0.1) 0%, transparent 50%),
                     ${C.dark}`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '120px 5% 80px',
      }}
    >
      {/* Decorative floating orbs */}
      <div className="gs-float-alt" style={{
        position: 'absolute', top: '15%', right: '8%',
        width: 420, height: 420, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(190,55,88,0.12), transparent 70%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div className="gs-float-slow" style={{
        position: 'absolute', bottom: '10%', left: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(254,219,153,0.08), transparent 70%)`,
        filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 60,
        }}>
          {/* Left content */}
          <div style={{ flex: 1, maxWidth: 640 }}>
            <div
              data-reveal
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 50,
                border: `1px solid rgba(190,55,88,0.4)`,
                background: 'rgba(190,55,88,0.1)',
                marginBottom: 28,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} className="gs-pulse-glow" />
              <span style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 3 }}>
                THE BUSINESS DESIGN COMPANY
              </span>
            </div>

            <h1
              data-reveal
              data-delay="0.1"
              style={{
                fontSize: 'clamp(52px, 7vw, 90px)',
                fontWeight: 900, lineHeight: 1.0,
                margin: '0 0 32px',
                letterSpacing: -2,
              }}
            >
              <span style={{ color: C.white, display: 'block' }}>We</span>
              <span
                style={{
                  display: 'block',
                  background: `linear-gradient(135deg, ${C.rose} 0%, ${C.coral} 50%, ${C.gold} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Enable
              </span>
              <span style={{ color: C.white, display: 'block' }}>Success</span>
            </h1>

            <p
              data-reveal
              data-delay="0.2"
              style={{ color: C.mauve, fontSize: 18, lineHeight: 1.75, marginBottom: 44, maxWidth: 480 }}
            >
              Strategy, transformation, and talent solutions that connect vision to ground reality — delivered by a global ecosystem of experts.
            </p>

            <div data-reveal data-delay="0.3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a
                href="/global/contact"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 32px', borderRadius: 50,
                  background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', letterSpacing: 1,
                  boxShadow: `0 8px 32px rgba(190,55,88,0.45)`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(190,55,88,0.6)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(190,55,88,0.45)`
                }}
              >
                START YOUR JOURNEY <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right: 3D crystal */}
          <div data-reveal data-delay="0.2" style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <OrbitalRings />
            </div>
            {/* Glow behind crystal */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 360, height: 360, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(190,55,88,0.25), transparent 70%)`,
              filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* Services cards below hero headline */}
        <div
          id="services"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24, marginTop: 80,
          }}
        >
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} s={s} delay={i * 0.12} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ s, delay }: { s: typeof SERVICES[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  return (
    <div
      ref={ref}
      data-reveal
      data-delay={delay.toString()}
      className="gs-tilt-card"
      style={{
        padding: '32px 28px',
        background: C.card,
        backdropFilter: 'blur(16px)',
        border: `1px solid rgba(156,136,155,0.2)`,
        borderRadius: 20,
        cursor: 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.2s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = s.accent
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${s.glow}`
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(156,136,155,0.2)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 20,
        background: `linear-gradient(135deg, ${s.accent}30, ${s.accent}15)`,
        border: `1px solid ${s.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <s.Icon size={22} color={s.accent} />
      </div>
      <h3 style={{ color: C.white, fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
        {s.title}
      </h3>
      <p style={{ color: C.mauve, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
        {s.description}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Stats Section
───────────────────────────────────────────── */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)
  const count = useCounter(value, triggered)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTriggered(true); io.disconnect() } },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        textAlign: 'center',
        padding: '36px 24px',
        background: C.card,
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(156,136,155,0.15)',
        borderRadius: 20,
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px rgba(190,55,88,0.2)`
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
        background: `linear-gradient(90deg, transparent, ${C.rose}, transparent)`,
      }} />
      <div
        style={{
          fontSize: 56, fontWeight: 900, lineHeight: 1,
          marginBottom: 8,
          background: `linear-gradient(135deg, ${C.gold}, ${C.coral})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}
      >
        {count}{suffix}
      </div>
      <div style={{ color: C.mauve, fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

function StatsSection() {
  return (
    <section style={{
      padding: '100px 5%',
      background: `linear-gradient(180deg, ${C.dark} 0%, ${C.dark2} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background mesh */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(190,55,88,0.06) 0%, transparent 50%),
                          radial-gradient(circle at 80% 50%, rgba(254,86,86,0.06) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p data-reveal style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 4, marginBottom: 12 }}>
            OUR IMPACT
          </p>
          <h2 data-reveal data-delay="0.1" style={{
            fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900,
            color: C.white, margin: 0, letterSpacing: -1,
          }}>
            A track record that speaks
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
        }}>
          {STATS.map((s, i) => (
            <StatCounter key={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Leaders Section
───────────────────────────────────────────── */
function LeaderCard({ leader, delay }: { leader: typeof LEADERS[number]; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div
      data-reveal
      data-delay={delay.toString()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        height: 480,
        cursor: 'pointer',
        border: hovered
          ? `1px solid rgba(190,55,88,0.7)`
          : '1px solid rgba(156,136,155,0.15)',
        boxShadow: hovered
          ? `0 32px 80px rgba(190,55,88,0.28), 0 0 0 1px rgba(190,55,88,0.15)`
          : '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* ── Photo background ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, #1e1628, #2a1f36)`,
      }}>
        {/* Initials placeholder */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 900, color: '#fff',
            boxShadow: `0 0 40px rgba(190,55,88,0.4)`,
          }}>
            {leader.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>

        {/* Actual photo */}
        <img
          src={leader.image}
          alt={leader.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: leader.imagePosition,
            filter: 'contrast(1.05) brightness(0.95)',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease',
            opacity: imgError ? 0 : 1,
          }}
          onError={() => setImgError(true)}
        />
      </div>

      {/* ── Default state: bottom name teaser ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '80px 24px 28px',
        background: 'linear-gradient(to top, rgba(13,10,18,0.92) 40%, transparent)',
        opacity: hovered ? 0 : 1,
        transform: hovered ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        zIndex: 2,
      }}>
        <span style={{
          display: 'inline-block',
          color: C.rose, fontSize: 10, fontWeight: 700,
          letterSpacing: 3, marginBottom: 6,
        }}>
          {leader.title.toUpperCase()}
        </span>
        <h3 style={{
          color: C.white, fontSize: 20, fontWeight: 800,
          margin: 0, letterSpacing: -0.3,
        }}>
          {leader.name}
        </h3>
      </div>

      {/* ── Hover overlay: full bio reveal ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to top,
          rgba(13,10,18,0.97) 0%,
          rgba(13,10,18,0.88) 55%,
          rgba(13,10,18,0.4) 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '32px 28px 32px',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.4s ease',
        zIndex: 3,
      }}>
        {/* Role badge */}
        <div style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          padding: '4px 14px', borderRadius: 50, marginBottom: 14,
          background: 'rgba(190,55,88,0.18)',
          border: '1px solid rgba(190,55,88,0.4)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s',
        }}>
          <span style={{ color: C.rose, fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
            {leader.title.toUpperCase()}
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          color: C.white, fontSize: 22, fontWeight: 800,
          margin: '0 0 10px', letterSpacing: -0.5,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.4s ease 0.12s, transform 0.4s ease 0.12s',
        }}>
          {leader.name}
        </h3>

        {/* Accent divider */}
        <div style={{
          width: hovered ? 44 : 0, height: 2, borderRadius: 2,
          background: `linear-gradient(90deg, ${C.rose}, ${C.coral})`,
          marginBottom: 16,
          transition: 'width 0.4s ease 0.18s',
        }} />

        {/* Bio */}
        <p style={{
          color: C.mauve, fontSize: 13.5, lineHeight: 1.8, margin: '0 0 20px',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.4s ease 0.22s, transform 0.4s ease 0.22s',
        }}>
          {leader.bio}
        </p>

        {/* LinkedIn */}
        <a
          href={leader.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(156,136,155,0.15)',
            border: '1px solid rgba(156,136,155,0.25)',
            color: C.mauve,
            textDecoration: 'none',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s, background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(190,55,88,0.2)'
            e.currentTarget.style.borderColor = 'rgba(190,55,88,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(156,136,155,0.15)'
            e.currentTarget.style.borderColor = 'rgba(156,136,155,0.25)'
          }}
        >
          <Linkedin size={16} />
        </a>
      </div>
    </div>
  )
}

function LeadersSection() {
  return (
    <section
      id="team"
      style={{
        padding: '100px 5%',
        background: C.dark,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, rgba(190,55,88,0.4), transparent)`,
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p data-reveal style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 4, marginBottom: 12 }}>
            LEADERSHIP
          </p>
          <h2 data-reveal data-delay="0.1" style={{
            fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900,
            color: C.white, margin: '0 0 16px', letterSpacing: -1,
          }}>
            Meet the leaders
          </h2>
          <p data-reveal data-delay="0.2" style={{ color: C.mauve, fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Visionaries who built Global from the ground up — driving results across 40 countries.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 28,
        }}>
          {LEADERS.map((l, i) => (
            <LeaderCard key={l.name} leader={l} delay={i * 0.13} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Partner logos data + grid
───────────────────────────────────────────── */
const PARTNERS = [
  { name: 'Everything DiSC',    src: '/partners/ED_AuthorizedPartner_Badge_WhiteBlue@2x.png', scale: 1.45 },
  { name: 'The Five Behaviors', src: '/partners/5B_Badge_AuthorizedPartnerRedWhite@2x.png',   scale: 1.45 },
  { name: 'Relevance',          src: '/partners/Relevence Logo fixed_edited.png',              scale: 1.1  },
  { name: 'Career Star Group',  src: '/partners/CSG Logo fixed_edited.png',                   scale: 1.1  },
]

function PartnerCard({ p }: { p: typeof PARTNERS[number] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 140,
        borderRadius: 12,
        overflow: 'hidden',
        /* No CSS border — all four logos carry their own white frames in the PNG */
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '14px 18px',
        boxSizing: 'border-box',
        /* Fully transparent — website background shows through on hover */
        background: 'transparent',
        cursor: 'default',
        transition: 'transform 0.3s ease',
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
      }}
    >
      <img
        src={p.src}
        alt={p.name}
        style={{
          /* auto sizing shrinks the element to the exact rendered image dimensions
             so box-shadow hugs the logo border, not the full container width */
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: 96,
          display: 'block',
          transform: `scale(${p.scale})`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  )
}

function PartnerGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
      {PARTNERS.map((p) => (
        <PartnerCard key={p.name} p={p} />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Partners Section
───────────────────────────────────────────── */
function PartnersSection() {
  return (
    <section
      id="partners"
      style={{
        padding: '100px 5%',
        background: `linear-gradient(180deg, ${C.dark2} 0%, ${C.dark} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 80, flexWrap: 'wrap' }}>
          {/* Left text */}
          <div style={{ flex: '1 1 380px' }}>
            <p data-reveal style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 4, marginBottom: 12 }}>
              ECOSYSTEM
            </p>
            <h2 data-reveal data-delay="0.1" style={{
              fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 900,
              color: C.white, margin: '0 0 24px', letterSpacing: -1, lineHeight: 1.1,
            }}>
              Our partners
            </h2>
            <p data-reveal data-delay="0.2" style={{
              color: C.mauve, fontSize: 15, lineHeight: 1.8, marginBottom: 24,
            }}>
              Global is part of a massive ecosystem of doers, consultants, innovators, and leaders who make a difference. Our ecosystem is comprised of principal partners who shape us and support us in caring for our customers.
            </p>
            <p data-reveal data-delay="0.3" style={{ color: C.mauve, fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
              Our collective reach crosses{' '}
              <span style={{ color: C.gold, fontWeight: 700 }}>10,000 individuals</span>{' '}
              across{' '}
              <span style={{ color: C.gold, fontWeight: 700 }}>70 countries</span>.
            </p>
          </div>

          {/* Right: partner logos */}
          <div data-reveal data-delay="0.2" style={{ flex: '1 1 420px' }}>
            <PartnerGrid />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Testimonials Section
───────────────────────────────────────────── */
function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((idx: number) => {
    setFading(true)
    setTimeout(() => {
      setActive(idx)
      setFading(false)
    }, 300)
  }, [])

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goTo((active + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active, goTo])

  const t = TESTIMONIALS[active]

  return (
    <section
      id="testimonials"
      style={{
        padding: '100px 5%',
        background: `radial-gradient(ellipse 100% 80% at 50% 50%, rgba(190,55,88,0.07) 0%, transparent 70%),
                     ${C.dark}`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, rgba(190,55,88,0.4), transparent)`,
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p data-reveal style={{ color: C.rose, fontSize: 12, fontWeight: 700, letterSpacing: 4, marginBottom: 12 }}>
            CLIENT VOICES
          </p>
          <h2 data-reveal data-delay="0.1" style={{
            fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900,
            color: C.white, margin: 0, letterSpacing: -1,
          }}>
            Testimonials
          </h2>
        </div>

        {/* Quote card */}
        <div
          style={{
            background: C.card,
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(156,136,155,0.2)',
            borderRadius: 28,
            padding: '52px 56px',
            position: 'relative',
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {/* Decorative quote mark */}
          <div style={{
            position: 'absolute', top: 36, right: 48,
            color: C.rose, opacity: 0.15,
          }}>
            <Quote size={72} />
          </div>
          {/* Accent line */}
          <div style={{
            width: 48, height: 3, borderRadius: 2,
            background: `linear-gradient(90deg, ${C.rose}, ${C.coral})`,
            marginBottom: 32,
          }} />
          <p style={{
            color: C.white, fontSize: 'clamp(15px,2vw,18px)',
            lineHeight: 1.85, fontStyle: 'italic', marginBottom: 36,
            position: 'relative', zIndex: 1,
          }}>
            "{t.quote}"
          </p>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontWeight: 800, fontSize: 23,
              background: 'linear-gradient(135deg, #BE3758, #FE5656)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{t.company}</div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 40 }}>
          <button
            onClick={() => goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: C.card, backdropFilter: 'blur(12px)',
              border: '1px solid rgba(156,136,155,0.3)',
              color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = C.rose
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(190,55,88,0.2)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(156,136,155,0.3)'
              ;(e.currentTarget as HTMLElement).style.background = C.card
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === active ? 28 : 8,
                  height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: i === active
                    ? `linear-gradient(90deg, ${C.rose}, ${C.coral})`
                    : 'rgba(156,136,155,0.35)',
                  transition: 'width 0.35s ease, background 0.2s',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => goTo((active + 1) % TESTIMONIALS.length)}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: C.card, backdropFilter: 'blur(12px)',
              border: '1px solid rgba(156,136,155,0.3)',
              color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = C.rose
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(190,55,88,0.2)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(156,136,155,0.3)'
              ;(e.currentTarget as HTMLElement).style.background = C.card
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Accelerate Section
───────────────────────────────────────────── */
function AccelerateSection() {
  return (
    <section style={{
      padding: '120px 5%',
      position: 'relative',
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${C.dark2} 0%, ${C.dark} 60%, rgba(190,55,88,0.04) 100%)`,
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900, height: 500, borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(190,55,88,0.13) 0%, transparent 65%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(254,86,86,0.07) 0%, transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Top border line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, rgba(190,55,88,0.5), transparent)`,
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <div data-reveal style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 20px', borderRadius: 50, marginBottom: 36,
          background: 'rgba(190,55,88,0.1)',
          border: '1px solid rgba(190,55,88,0.3)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose }} />
          <span style={{ color: C.rose, fontSize: 11, fontWeight: 700, letterSpacing: 3 }}>
            YOUR NEXT STEP
          </span>
        </div>

        {/* Headline */}
        <h2 data-reveal data-delay="0.1" style={{
          fontSize: 'clamp(38px, 5.5vw, 72px)',
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: -2,
          margin: '0 0 28px',
          color: C.white,
        }}>
          Ready to accelerate{' '}
          <span style={{
            background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            your success?
          </span>
        </h2>

        {/* Sub-headline */}
        <h3 data-reveal data-delay="0.18" style={{
          fontSize: 'clamp(18px, 2.2vw, 26px)',
          fontWeight: 600,
          color: C.gold,
          margin: '0 0 24px',
          letterSpacing: 0,
        }}>
          Leap towards outcomes
        </h3>

        {/* Body */}
        <p data-reveal data-delay="0.26" style={{
          fontSize: 'clamp(15px, 1.6vw, 18px)',
          color: C.mauve,
          lineHeight: 1.85,
          maxWidth: 620,
          margin: '0 auto 52px',
        }}>
          Find out why over{' '}
          <strong style={{ color: C.white, fontWeight: 700 }}>85% of our customers</strong>{' '}
          come back to work with us or refer us to their friends and colleagues.
        </p>

        {/* CTA button */}
        <div data-reveal data-delay="0.34" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a
            href="/global/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '18px 48px', borderRadius: 50,
              background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
              color: '#fff', fontWeight: 800, fontSize: 15,
              textDecoration: 'none', letterSpacing: 1,
              boxShadow: `0 12px 48px rgba(190,55,88,0.45)`,
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 20px 60px rgba(190,55,88,0.65)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 12px 48px rgba(190,55,88,0.45)`
            }}
          >
            GET IN TOUCH <ArrowRight size={18} />
          </a>
        </div>

        {/* Decorative divider below */}
        <div data-reveal data-delay="0.4" style={{
          display: 'flex', alignItems: 'center', gap: 16,
          marginTop: 64, justifyContent: 'center',
        }}>
          <div style={{ height: 1, width: 80, background: `linear-gradient(90deg, transparent, rgba(156,136,155,0.3))` }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[C.rose, C.coral, C.gold].map((col, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: col, opacity: 0.7 }} />
            ))}
          </div>
          <div style={{ height: 1, width: 80, background: `linear-gradient(90deg, rgba(156,136,155,0.3), transparent)` }} />
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Page root
───────────────────────────────────────────── */
export default function GlobalHomePage() {
  useScrollReveal()

  return (
    <main style={{ backgroundColor: C.dark, color: C.white, fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <LeadersSection />
      <PartnersSection />
      <TestimonialsSection />
      <AccelerateSection />
      <GlobalFooter />
    </main>
  )
}


