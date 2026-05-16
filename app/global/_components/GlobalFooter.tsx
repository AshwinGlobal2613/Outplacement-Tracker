'use client'
import { Linkedin, Instagram, Youtube, Facebook } from 'lucide-react'

const C = {
  dark:  '#0d0a12',
  rose:  '#be3758',
  coral: '#fe5656',
  mauve: '#9c889b',
  gold:  '#fedb99',
  white: '#f5f3f7',
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

const SOCIAL = [
  { icon: <Linkedin  size={18} />, href: 'https://www.linkedin.com/company/globalconsults/',        label: 'LinkedIn'  },
  { icon: <Instagram size={18} />, href: 'https://www.instagram.com/globalconsultshq/',             label: 'Instagram' },
  { icon: <XIcon     size={18} />, href: 'https://twitter.com/GlobalConsults',                       label: 'X'         },
  { icon: <Youtube   size={18} />, href: 'https://www.youtube.com/@globalthedesigncompany',          label: 'YouTube'   },
  { icon: <Facebook  size={18} />, href: 'https://www.facebook.com/GlobalConsults',                  label: 'Facebook'  },
]

export default function GlobalFooter() {
  return (
    <footer style={{
      background: '#080610',
      borderTop: '1px solid rgba(156,136,155,0.12)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes rogerFloat {
          0%,100% { transform: translateY(0px)   rotate(-1.5deg) scale(1);    }
          33%      { transform: translateY(-14px) rotate( 1deg)   scale(1.02); }
          66%      { transform: translateY(-8px)  rotate(-0.5deg) scale(1.01); }
        }
        @keyframes rogerReveal {
          from { opacity: 0; transform: translateX(-50px) translateY(30px) rotate(-4deg); }
          to   { opacity: 1; transform: translateX(0)     translateY(0)    rotate(-1.5deg); }
        }
        .gf-social:hover {
          transform: scale(1.15) !important;
          background: rgba(190,55,88,0.18) !important;
          border-color: rgba(190,55,88,0.45) !important;
          color: #f5f3f7 !important;
        }
      `}</style>

      {/* ── Roger mascot ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: -10,
        width: 360,
        zIndex: 2,
        pointerEvents: 'none',
        animation: 'rogerReveal 1.2s cubic-bezier(0.22,1,0.36,1) forwards, rogerFloat 7s ease-in-out 1.2s infinite',
      }}>
        <img src="/roger.png" alt="" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
      </div>

      {/* ── Main content ── */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '48px 5% 36px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ── Map + Socials row ── */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>

          {/* Map — full remaining width */}
          <div style={{
            flex: 1,
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid rgba(156,136,155,0.18)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.55)',
            minHeight: 300,
          }}>
            <iframe
              src="https://maps.google.com/maps?q=API+World+Tower,+Sheikh+Zayed+Road,+Dubai,+UAE&output=embed&iwloc=&z=15"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', minHeight: 300 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Social icons — right column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 14,
            flexShrink: 0,
            width: 72,
          }}>
            {SOCIAL.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="gf-social"
                style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'rgba(51,42,63,0.5)',
                  border: '1px solid rgba(156,136,155,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.mauve,
                  textDecoration: 'none',
                  transition: 'transform 0.25s, background 0.25s, border-color 0.25s, color 0.25s',
                  flexShrink: 0,
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Address */}
        <p style={{
          color: C.mauve,
          fontSize: 14,
          lineHeight: 1.75,
          margin: '0 0 20px',
          letterSpacing: 0.3,
          textAlign: 'center',
        }}>
          Ground Floor, Unit 008, UNBOX Community,&nbsp;
          API World Tower, Sheikh Zayed Road, Dubai, UAE
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(156,136,155,0.1)', marginBottom: 20 }} />

        {/* Copyright */}
        <p style={{
          color: C.rose,
          fontSize: 13,
          margin: 0,
          letterSpacing: 0.4,
          opacity: 0.85,
          textAlign: 'center',
        }}>
          © 2026 by Global Management Consultants. All Rights Reserved
        </p>
      </div>
    </footer>
  )
}
