import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, category, message } = body

    // Validation
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: "Pedagogist's PTE <noreply@pedagogistpte.com>",
      to: ["support@pedagogistpte.com"], // Replace with your support email
      replyTo: email,
      subject: `[${category.toUpperCase()}] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
        <hr />
        <p><small>Sent via Pedagogist's PTE Contact Form</small></p>
      `,
    })

    // Send confirmation email to user
    await resend.emails.send({
      from: "Pedagogist's PTE <noreply@pedagogistpte.com>",
      to: [email],
      subject: "We received your message",
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <p><em>${subject}</em></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
        <hr />
        <p>Best regards,<br />Pedagogist's PTE Support Team</p>
        <p><small>If you didn't send this, please ignore this email.</small></p>
      `,
    })

    return NextResponse.json(
      { success: true, id: emailResult.data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    )
  }
}
