import { NextRequest, NextResponse } from 'next/server'

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, interest, message } = await req.json()

    const text = [
      '*New Contact Form Submission*',
      `*Name:* ${firstName} ${lastName}`,
      `*Email:* ${email}`,
      `*Phone:* ${phone || 'Not provided'}`,
      `*Area of Interest:* ${interest || 'Not specified'}`,
      `*Message:*\n${message || '_(none)_'}`,
    ].join('\n')

    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    const slackBody = await slackRes.text()
    console.log('Slack response:', slackRes.status, slackBody)

    if (!slackRes.ok) {
      return NextResponse.json({ error: `Slack error: ${slackBody}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
