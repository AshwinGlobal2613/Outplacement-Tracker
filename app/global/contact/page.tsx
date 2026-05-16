'use client'

import { useState, useEffect } from 'react'
import GlobalFooter from '../_components/GlobalFooter'
import { Menu, X, Globe2, Linkedin, Instagram, Youtube, Facebook, MapPin, Phone, Mail, ThumbsUp, Send } from 'lucide-react'

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
    { label: 'Contact',      href: '/global/contact' },
  ]
  const active = 'Contact'

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

/* ─────────────────────────────────────────────
   Contact Form
───────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', interest: '', message: '',
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const interests = ['Our Services', 'General Inquiry', 'Joining Global']

  const inputStyle = (name: string) => ({
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(26,18,37,0.7)',
    border: `1px solid ${focusedField === name ? C.rose : 'rgba(156,136,155,0.25)'}`,
    borderRadius: 10,
    color: C.white,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
  })

  const labelStyle = {
    color: '#FEDB99',
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: 0.5,
    marginBottom: 8,
    display: 'block' as const,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 0 32px rgba(190,55,88,0.4)` }}>
          <Send size={28} color="#fff" />
        </div>
        <h3 style={{ color: C.white, fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>Message Sent!</h3>
        <p style={{ color: C.mauve, fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
          Thank you for reaching out. Our team will get back to you shortly.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', phone: '', interest: '', message: '' }) }}
          style={{ padding: '12px 28px', borderRadius: 50, background: 'transparent', border: `1px solid ${C.rose}`, color: C.rose, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = `rgba(190,55,88,0.15)` }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >Send Another</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* First + Last name row */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>First Name</label>
          <input
            type="text" value={form.firstName} required
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            onFocus={() => setFocusedField('firstName')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('firstName')}
            placeholder=""
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Last Name</label>
          <input
            type="text" value={form.lastName} required
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            onFocus={() => setFocusedField('lastName')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('lastName')}
            placeholder=""
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email" value={form.email} required
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          style={inputStyle('email')}
          placeholder=""
        />
      </div>

      {/* Phone */}
      <div>
        <label style={labelStyle}>Phone</label>
        <input
          type="tel" value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          onFocus={() => setFocusedField('phone')}
          onBlur={() => setFocusedField(null)}
          style={inputStyle('phone')}
          placeholder=""
        />
      </div>

      {/* Area of Interest — custom dropdown */}
      <div style={{ position: 'relative' }}>
        <label style={labelStyle}>Area Of Interest</label>
        <button
          type="button"
          onClick={() => setDropdownOpen(o => !o)}
          style={{
            width: '100%', padding: '14px 16px',
            background: 'rgba(26,18,37,0.7)',
            border: `1px solid ${dropdownOpen ? C.rose : 'rgba(156,136,155,0.25)'}`,
            borderRadius: dropdownOpen ? '10px 10px 0 0' : 10,
            color: form.interest ? C.white : C.mauve,
            fontSize: 14, cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'border-color 0.2s',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <span>{form.interest || 'Choose an option'}</span>
          <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: C.mauve, fontSize: 18 }}>⌄</span>
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            background: 'rgba(26,18,37,0.98)', backdropFilter: 'blur(12px)',
            border: `1px solid ${C.rose}`, borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
          }}>
            {interests.map(opt => (
              <button
                key={opt} type="button"
                onClick={() => { setForm(f => ({ ...f, interest: opt })); setDropdownOpen(false) }}
                style={{
                  width: '100%', padding: '13px 16px', textAlign: 'left',
                  background: form.interest === opt ? 'rgba(190,55,88,0.15)' : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(156,136,155,0.1)',
                  color: form.interest === opt ? C.coral : C.white,
                  fontSize: 14, cursor: 'pointer', transition: 'background 0.15s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(190,55,88,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = form.interest === opt ? 'rgba(190,55,88,0.15)' : 'transparent')}
              >{opt}</button>
            ))}
          </div>
        )}
      </div>

      {/* Message */}
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          onFocus={() => setFocusedField('message')}
          onBlur={() => setFocusedField(null)}
          rows={4}
          style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 100 }}
          placeholder=""
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: C.coral, fontSize: 13, margin: '0', textAlign: 'right' }}>{error}</p>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px 44px', borderRadius: 50,
            background: loading ? 'rgba(190,55,88,0.5)' : `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
            color: '#fff', fontSize: 15, fontWeight: 700,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1,
            boxShadow: `0 4px 24px rgba(190,55,88,0.45)`,
            transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(190,55,88,0.6)` } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px rgba(190,55,88,0.45)` }}
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>

    </form>
  )
}

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function ContactPage() {
  const socials = [
    { icon: <Linkedin  size={20} />, href: 'https://www.linkedin.com/company/globalconsults/',        label: 'LinkedIn'  },
    { icon: <Instagram size={20} />, href: 'https://www.instagram.com/globalconsultshq/',             label: 'Instagram' },
    { icon: <XIcon     size={20} />, href: 'https://twitter.com/GlobalConsults',                       label: 'X'         },
    { icon: <Youtube   size={20} />, href: 'https://www.youtube.com/@globalthedesigncompany',          label: 'YouTube'   },
    { icon: <Facebook  size={20} />, href: 'https://www.facebook.com/GlobalConsults',                  label: 'Facebook'  },
  ]

  return (
    <main style={{ background: C.dark, color: C.white, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Nav />

      {/* ── Contact Section ── */}
      <section style={{
        minHeight: '100vh',
        padding: '120px 5% 80px',
        background: `linear-gradient(135deg, ${C.dark2} 0%, ${C.dark} 60%)`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
      }}>
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,55,88,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '0%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,55,88,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', gap: 80, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>

          {/* ── LEFT — Contact info ── */}
          <div style={{ flex: '0 0 auto', width: 'clamp(260px, 30%, 360px)' }}>

            {/* Heading */}
            <h1 style={{
              fontSize: 'clamp(52px, 6vw, 88px)',
              fontWeight: 900, lineHeight: 1,
              background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              margin: '0 0 56px', letterSpacing: -1,
            }}>Contact</h1>

            {/* Info items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Address */}
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(190,55,88,0.12)', border: '1px solid rgba(190,55,88,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} color={C.coral} />
                </div>
                <p style={{ color: C.mauve, fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>
                  Ground Floor, Unit 008, UNBOX Community,<br />
                  API World Tower, Sheikh Zayed Road,<br />
                  Dubai. United Arab Emirates
                </p>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(190,55,88,0.12)', border: '1px solid rgba(190,55,88,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} color={C.coral} />
                </div>
                <a href="tel:+97145280600" style={{ color: C.mauve, fontSize: 14.5, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.mauve)}
                >+971 4 528 0600</a>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(190,55,88,0.12)', border: '1px solid rgba(190,55,88,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} color={C.coral} />
                </div>
                <a href="mailto:team@global-dubai.com" style={{ color: C.mauve, fontSize: 14.5, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.mauve)}
                >team@global-dubai.com</a>
              </div>

              {/* Social icons */}
              <div style={{ display: 'flex', gap: 14, marginTop: 8, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(190,55,88,0.12)', border: '1px solid rgba(190,55,88,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ThumbsUp size={18} color={C.coral} />
                </div>
                {socials.map(({ icon, href, label }) => (
                  <a key={label} href={href} aria-label={label} style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(51,42,63,0.5)',
                    border: '1px solid rgba(156,136,155,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: C.mauve, textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.rose; e.currentTarget.style.color = C.white; e.currentTarget.style.background = 'rgba(190,55,88,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(156,136,155,0.18)'; e.currentTarget.style.color = C.mauve; e.currentTarget.style.background = 'rgba(51,42,63,0.5)' }}
                  >{icon}</a>
                ))}
              </div>

            </div>
          </div>

          {/* ── RIGHT — Contact form card ── */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{
              background: 'rgba(26,18,37,0.75)',
              backdropFilter: 'blur(24px)',
              borderRadius: 24,
              border: '1px solid rgba(190,55,88,0.15)',
              padding: 'clamp(28px, 4vw, 48px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(190,55,88,0.05)',
            }}>
              <ContactForm />
            </div>
          </div>

        </div>
      </section>

      <GlobalFooter />
    </main>
  )
}


