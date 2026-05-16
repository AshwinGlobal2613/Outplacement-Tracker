'use client'

export default function BackgroundOrb() {
  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1);    }
          50%       { transform: translate(-50%, -50%) scale(1.03); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.88; }
          50%       { opacity: 1;    }
        }
      `}</style>

      {/* 3D sphere — sits over the video oval, screen blend lets the rings show through */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 200,
        height: 200,
        borderRadius: '50%',
        mixBlendMode: 'screen',
        background: `
          radial-gradient(circle at 33% 28%,
            rgba(255, 220, 210, 1)   0%,
            rgba(250, 110, 120, 1)  10%,
            rgba(210,  50,  80, 1)  25%,
            rgba(170,  25,  58, 1)  44%,
            rgba(115,  10,  38, 1)  62%,
            rgba(65,    3,  20, 1)  78%,
            rgba(22,    0,   7, 1) 100%
          )
        `,
        boxShadow: `
          0 0 35px 12px rgba(200, 50, 80, 0.55),
          0 0 80px 30px rgba(190, 40, 70, 0.30),
          0 0 160px 55px rgba(180, 30, 60, 0.14)
        `,
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'orbFloat 6s ease-in-out infinite, orbPulse 4s ease-in-out infinite',
      }}>
        {/* Primary specular glint */}
        <div style={{
          position: 'absolute',
          top: '16%', left: '22%',
          width: 48, height: 30,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,245,240,0.9) 0%, rgba(255,210,200,0.4) 50%, transparent 100%)',
          transform: 'rotate(-22deg)',
          filter: 'blur(3px)',
        }} />

        {/* Secondary soft highlight */}
        <div style={{
          position: 'absolute',
          top: '25%', left: '28%',
          width: 80, height: 52,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,180,170,0.22) 0%, transparent 100%)',
          filter: 'blur(7px)',
        }} />

        {/* Rim light bottom-right */}
        <div style={{
          position: 'absolute',
          bottom: '12%', right: '14%',
          width: 60, height: 36,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(230, 80, 100, 0.25) 0%, transparent 100%)',
          filter: 'blur(9px)',
        }} />
      </div>
    </>
  )
}
