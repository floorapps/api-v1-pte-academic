import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Pedagogist's PTE",
  description: "Learn how we collect, use, and protect your personal information",
}

export default function PrivacyPolicyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to Pedagogist's PTE ("we," "our," or "us"). We are committed to protecting your personal information
        and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you use our PTE Academic practice platform.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Personal Information</h3>
      <p>We collect personal information that you voluntarily provide to us when you:</p>
      <ul>
        <li>Register for an account (name, email address, password)</li>
        <li>Complete your user profile (target score, exam date, preferred study times)</li>
        <li>Use our practice features</li>
        <li>Contact our support team</li>
        <li>Subscribe to our newsletter or marketing communications</li>
      </ul>

      <h3>2.2 Automatically Collected Information</h3>
      <p>When you visit our platform, we automatically collect certain information, including:</p>
      <ul>
        <li>Device information (IP address, browser type, operating system)</li>
        <li>Usage data (pages visited, time spent, features used)</li>
        <li>Cookies and similar tracking technologies</li>
      </ul>

      <h3>2.3 Practice and Performance Data</h3>
      <p>To provide our services, we collect:</p>
      <ul>
        <li>Audio recordings of your speaking responses</li>
        <li>Written responses for writing and typing tasks</li>
        <li>Selected answers for multiple-choice questions</li>
        <li>Practice session timestamps and duration</li>
        <li>AI scoring results and feedback</li>
        <li>Progress analytics and performance metrics</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide, operate, and maintain our PTE practice platform</li>
        <li>Process your practice attempts and generate AI-powered feedback</li>
        <li>Track your progress and provide personalized analytics</li>
        <li>Improve our AI scoring algorithms and user experience</li>
        <li>Send you administrative information, updates, and security alerts</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Send marketing communications (with your consent)</li>
        <li>Detect and prevent fraud or abuse</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>4. Data Storage and Security</h2>
      <p>
        We implement industry-standard security measures to protect your personal information:
      </p>
      <ul>
        <li>End-to-end encryption for data transmission (SSL/TLS)</li>
        <li>Secure cloud storage with reputable providers (PostgreSQL, Vercel Blob Storage)</li>
        <li>Regular security audits and vulnerability assessments</li>
        <li>Access controls and authentication mechanisms (Better Auth)</li>
        <li>Regular data backups</li>
      </ul>
      <p>
        However, no method of transmission over the Internet is 100% secure. While we strive to protect your information,
        we cannot guarantee absolute security.
      </p>

      <h2>5. Data Sharing and Disclosure</h2>
      <p>We do not sell your personal information. We may share your information with:</p>

      <h3>5.1 Service Providers</h3>
      <ul>
        <li><strong>OpenAI:</strong> For AI-powered speech transcription and content scoring</li>
        <li><strong>Google Gemini:</strong> For alternative AI scoring models</li>
        <li><strong>Vercel:</strong> For hosting and storage services</li>
        <li><strong>Stripe/Polar:</strong> For payment processing (we do not store full credit card details)</li>
        <li><strong>Better Auth:</strong> For authentication services</li>
        <li><strong>Resend:</strong> For transactional email delivery</li>
      </ul>

      <h3>5.2 Legal Requirements</h3>
      <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>

      <h3>5.3 Business Transfers</h3>
      <p>
        If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
      </p>

      <h2>6. Your Privacy Rights</h2>
      <p>Depending on your location, you may have the following rights:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
        <li><strong>Deletion:</strong> Request deletion of your personal information</li>
        <li><strong>Data Portability:</strong> Request a copy of your data in a machine-readable format</li>
        <li><strong>Objection:</strong> Object to processing of your personal information</li>
        <li><strong>Restriction:</strong> Request restriction of processing</li>
        <li><strong>Withdrawal of Consent:</strong> Withdraw consent for marketing communications</li>
      </ul>
      <p>
        To exercise these rights, please contact us at{" "}
        <a href="mailto:privacy@pedagogistpte.com">privacy@pedagogistpte.com</a>
      </p>

      <h2>7. Cookies and Tracking Technologies</h2>
      <p>We use cookies and similar tracking technologies to:</p>
      <ul>
        <li>Remember your preferences and settings</li>
        <li>Understand how you use our platform</li>
        <li>Provide personalized content and recommendations</li>
        <li>Analyze usage patterns and improve our services</li>
      </ul>
      <p>
        You can control cookies through your browser settings. However, disabling cookies may limit some functionality.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information
        from children. If you believe we have collected information from a child, please contact us immediately.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be transferred to and maintained on servers located outside of your country of residence.
        We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
      </p>

      <h2>10. Retention Period</h2>
      <p>
        We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
      </p>
      <ul>
        <li><strong>Account Information:</strong> Until you delete your account, plus 30 days</li>
        <li><strong>Practice Data:</strong> Until you delete your account, or as long as needed for analytics</li>
        <li><strong>Audio Recordings:</strong> 90 days after practice session (unless saved by you)</li>
        <li><strong>Payment Information:</strong> As required by law (typically 7 years)</li>
      </ul>

      <h2>11. Third-Party Links</h2>
      <p>
        Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these
        external sites. We encourage you to read their privacy policies.
      </p>

      <h2>12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new
        Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy
        periodically.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        If you have questions or concerns about this Privacy Policy, please contact us:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:privacy@pedagogistpte.com">privacy@pedagogistpte.com</a></li>
        <li><strong>Support:</strong> <a href="/contact">Contact Form</a></li>
      </ul>

      <div className="mt-8 rounded-lg border bg-muted p-6">
        <h3 className="mb-2 text-lg font-semibold">GDPR Compliance</h3>
        <p className="text-sm">
          For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR).
          See our <a href="/legal/gdpr" className="underline">GDPR Compliance page</a> for more information.
        </p>
      </div>
    </article>
  )
}
