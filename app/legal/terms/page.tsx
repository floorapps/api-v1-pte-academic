import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Pedagogist's PTE",
  description: "Terms and conditions for using Pedagogist's PTE platform",
}

export default function TermsOfServicePage() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using Pedagogist's PTE ("the Platform"), you agree to be bound by these Terms of Service ("Terms").
        If you do not agree to these Terms, please do not use our Platform.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        Pedagogist's PTE is an online PTE Academic test preparation platform that provides:
      </p>
      <ul>
        <li>Practice questions for all PTE Academic question types</li>
        <li>AI-powered scoring and feedback for speaking, writing, reading, and listening tasks</li>
        <li>Full-length mock tests simulating the actual PTE Academic exam</li>
        <li>Performance analytics and progress tracking</li>
        <li>Study materials and tips</li>
      </ul>
      <p>
        <strong>Important Notice:</strong> Pedagogist's PTE is an independent test preparation service and is NOT affiliated
        with, endorsed by, or connected to Pearson PLC or the official PTE Academic test.
      </p>

      <h2>3. Account Registration</h2>

      <h3>3.1 Eligibility</h3>
      <p>
        You must be at least 16 years old to create an account. By registering, you represent that you meet this age requirement.
      </p>

      <h3>3.2 Account Responsibilities</h3>
      <p>You are responsible for:</p>
      <ul>
        <li>Maintaining the confidentiality of your account credentials</li>
        <li>All activities that occur under your account</li>
        <li>Notifying us immediately of any unauthorized use</li>
        <li>Providing accurate and up-to-date information</li>
      </ul>

      <h3>3.3 Account Termination</h3>
      <p>
        We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent,
        abusive, or illegal activity.
      </p>

      <h2>4. Subscription and Payment</h2>

      <h3>4.1 Subscription Plans</h3>
      <p>We offer the following subscription tiers:</p>
      <ul>
        <li><strong>Free:</strong> Limited access to practice questions and 1 mock test</li>
        <li><strong>Pro ($29/month):</strong> Unlimited practice, 200 mock tests, full analytics</li>
        <li><strong>Premium ($49/month):</strong> Everything in Pro plus priority AI scoring and personalized study plans</li>
      </ul>

      <h3>4.2 Payment Terms</h3>
      <ul>
        <li>Subscriptions are billed monthly or annually as selected</li>
        <li>Payments are processed securely through Stripe or Polar</li>
        <li>All fees are in USD unless otherwise stated</li>
        <li>Prices are subject to change with 30 days' notice</li>
      </ul>

      <h3>4.3 Auto-Renewal</h3>
      <p>
        Subscriptions automatically renew unless canceled before the renewal date. You can cancel anytime from your
        account settings.
      </p>

      <h3>4.4 Refunds</h3>
      <p>
        See our <a href="/legal/refund" className="underline">Refund Policy</a> for detailed information about refunds
        and cancellations.
      </p>

      <h2>5. Acceptable Use Policy</h2>

      <h3>5.1 Permitted Use</h3>
      <p>You may use the Platform for:</p>
      <ul>
        <li>Personal PTE Academic test preparation</li>
        <li>Practicing and improving your English language skills</li>
        <li>Accessing study materials and resources</li>
      </ul>

      <h3>5.2 Prohibited Activities</h3>
      <p>You agree NOT to:</p>
      <ul>
        <li>Share your account credentials with others</li>
        <li>Use the Platform for commercial purposes without permission</li>
        <li>Copy, reproduce, or distribute our content without authorization</li>
        <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
        <li>Use automated scripts, bots, or scrapers to access the Platform</li>
        <li>Upload malicious code, viruses, or harmful content</li>
        <li>Impersonate others or provide false information</li>
        <li>Abuse or harass other users or our support team</li>
        <li>Attempt to gain unauthorized access to our systems</li>
        <li>Use the Platform in any way that violates applicable laws</li>
      </ul>

      <h2>6. Intellectual Property Rights</h2>

      <h3>6.1 Our Content</h3>
      <p>
        All content on the Platform, including but not limited to text, graphics, logos, images, audio recordings,
        software, and AI algorithms, is the property of Pedagogist's PTE or its licensors and is protected by copyright,
        trademark, and other intellectual property laws.
      </p>

      <h3>6.2 Your Content</h3>
      <p>
        You retain ownership of the content you create (speaking recordings, written responses). However, by using the
        Platform, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your content
        for the purposes of:
      </p>
      <ul>
        <li>Providing our services (AI scoring, feedback, analytics)</li>
        <li>Improving our AI algorithms and scoring accuracy</li>
        <li>Generating anonymized aggregated statistics</li>
      </ul>

      <h3>6.3 Trademarks</h3>
      <p>
        "Pedagogist's PTE" and associated logos are trademarks of our company. PTE Academic is a trademark of Pearson PLC.
        We are not affiliated with or endorsed by Pearson PLC.
      </p>

      <h2>7. AI Scoring Disclaimer</h2>
      <p>
        Our AI scoring system provides estimated scores based on machine learning algorithms. While we strive for accuracy:
      </p>
      <ul>
        <li>AI scores are predictions and may differ from actual PTE Academic exam scores</li>
        <li>Scores should be used as practice feedback, not as guarantees of exam performance</li>
        <li>We do not guarantee that using our Platform will result in specific exam scores</li>
        <li>The official PTE Academic exam uses proprietary scoring algorithms that we cannot replicate exactly</li>
      </ul>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
        INCLUDING BUT NOT LIMITED TO:
      </p>
      <ul>
        <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
        <li>That the Platform will be uninterrupted, error-free, or secure</li>
        <li>That defects will be corrected</li>
        <li>That the Platform or servers are free of viruses or harmful components</li>
      </ul>

      <h2>9. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, PEDAGOGIST'S PTE SHALL NOT BE LIABLE FOR:
      </p>
      <ul>
        <li>Any indirect, incidental, special, consequential, or punitive damages</li>
        <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
        <li>Damages resulting from your use or inability to use the Platform</li>
        <li>Unauthorized access to or alteration of your data</li>
        <li>Third-party conduct or content on the Platform</li>
      </ul>
      <p>
        OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM, OR $100, WHICHEVER IS GREATER.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Pedagogist's PTE, its affiliates, and their respective officers,
        directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees)
        arising from:
      </p>
      <ul>
        <li>Your use of the Platform</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any rights of another party</li>
        <li>Your content or conduct on the Platform</li>
      </ul>

      <h2>11. Data Privacy</h2>
      <p>
        Your use of the Platform is also governed by our <a href="/legal/privacy" className="underline">Privacy Policy</a>,
        which explains how we collect, use, and protect your personal information.
      </p>

      <h2>12. Third-Party Services</h2>
      <p>
        The Platform integrates with third-party services (OpenAI, Google Gemini, Stripe, etc.). We are not responsible
        for the availability, accuracy, or reliability of these third-party services.
      </p>

      <h2>13. Modifications to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by:
      </p>
      <ul>
        <li>Posting a notice on the Platform</li>
        <li>Sending an email to your registered email address</li>
        <li>Updating the "Last Updated" date at the top of this page</li>
      </ul>
      <p>
        Your continued use of the Platform after changes constitute acceptance of the revised Terms.
      </p>

      <h2>14. Governing Law and Dispute Resolution</h2>

      <h3>14.1 Governing Law</h3>
      <p>
        These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to
        its conflict of law principles.
      </p>

      <h3>14.2 Dispute Resolution</h3>
      <p>
        Any disputes arising from these Terms or your use of the Platform shall be resolved through:
      </p>
      <ol>
        <li>Informal negotiation first (contact us at <a href="mailto:legal@pedagogistpte.com">legal@pedagogistpte.com</a>)</li>
        <li>Binding arbitration if negotiation fails</li>
      </ol>

      <h3>14.3 Class Action Waiver</h3>
      <p>
        You agree to resolve disputes on an individual basis only. You waive any right to participate in class actions
        or class arbitrations.
      </p>

      <h2>15. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or
        eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
      </p>

      <h2>16. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and
        Pedagogist's PTE regarding the use of the Platform.
      </p>

      <h2>17. Contact Information</h2>
      <p>
        If you have questions about these Terms, please contact us:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:legal@pedagogistpte.com">legal@pedagogistpte.com</a></li>
        <li><strong>Support:</strong> <a href="/contact">Contact Form</a></li>
      </ul>

      <div className="mt-8 rounded-lg border bg-muted p-6">
        <h3 className="mb-2 text-lg font-semibold">By using Pedagogist's PTE, you acknowledge that:</h3>
        <ul className="text-sm">
          <li>You have read and understood these Terms of Service</li>
          <li>You agree to be bound by these Terms</li>
          <li>You are at least 16 years old</li>
          <li>Your use of the Platform complies with all applicable laws</li>
        </ul>
      </div>
    </article>
  )
}
