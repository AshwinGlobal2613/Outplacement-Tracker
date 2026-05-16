import ChatWidget from './_components/ChatWidget'

export default function GlobalSiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="global-site-root" style={{ position: 'relative', minHeight: '100vh', background: '#0d0a12' }}>

      {/* ── Override page/section solid backgrounds so video shows through ── */}
      <style>{`
        .global-site-root main {
          background: transparent !important;
        }
        .global-site-root section {
          background: rgba(13, 10, 18, 0.72) !important;
        }
      `}</style>

      {/* ── Looping background video ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.45,
        }}
      >
        <source src="/Background-video.mp4" type="video/mp4" />
      </video>

      {/* Page content — above video */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* ── AI Chat Widget ── */}
      <ChatWidget />

    </div>
  )
}
