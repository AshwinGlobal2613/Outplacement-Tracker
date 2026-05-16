import { NextRequest, NextResponse } from 'next/server'

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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'

export async function POST(req: NextRequest) {
  try {
    const { userMessage, botReply } = await req.json()

    const text = [
      '*New Chat Message on Global Website*',
      `*Asked:* ${userMessage}`,
      `*Roger replied:* ${botReply.replace(/\*\*/g, '*')}`,
    ].join('\n')

    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!slackRes.ok) {
      const err = await slackRes.text()
      return NextResponse.json({ error: `Slack error: ${err}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Chat notify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
