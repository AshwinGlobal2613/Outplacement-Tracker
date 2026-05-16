'use client'
import { useEffect, useRef, useState } from 'react'

const C = {
  card: 'rgba(28,20,40,0.75)',
  rose: '#be3758',
  coral: '#fe5656',
  mauve: '#9c889b',
  white: '#f5f3f7',
}

type Stat = { end: number; suffix: string; label: string }

const STATS: Stat[] = [
  { end: 27,  suffix: '+', label: 'Years of Experience' },
  { end: 27,  suffix: '',  label: 'Countries Reached'   },
  { end: 220, suffix: '+', label: 'Happy Clients'       },
  { end: 85,  suffix: '%', label: 'Repeat & Referral'   },
]

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

function useCounter(end: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(easeOutQuart(progress) * end))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(end)
    }
    requestAnimationFrame(step)
  }, [active, end, duration])
  return count
}

function StatCard({ stat, active, delay }: { stat: Stat; active: boolean; delay: number }) {
  const [fired, setFired] = useState(false)
  useEffect(() => {
    if (active && !fired) {
      const t = setTimeout(() => setFired(true), delay)
      return () => clearTimeout(t)
    }
  }, [active, fired, delay])
  const count = useCounter(stat.end, 1800, fired)

  return (
    <div style={{
      background: C.card,
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(156,136,155,0.15)',
      borderRadius: 16,
      padding: '28px 22px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 36,
        fontWeight: 800,
        background: `linear-gradient(135deg, ${C.rose}, ${C.coral})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 6,
        fontVariantNumeric: 'tabular-nums',
        minWidth: 80,
        display: 'inline-block',
      }}>
        {count}{stat.suffix}
      </div>
      <div style={{ color: C.mauve, fontSize: 13, fontWeight: 500 }}>{stat.label}</div>
    </div>
  )
}

export default function CounterStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {STATS.map((s, i) => (
        <StatCard key={s.label} stat={s} active={active} delay={i * 120} />
      ))}
    </div>
  )
}
