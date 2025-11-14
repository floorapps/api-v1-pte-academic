import { Metadata } from "next"

export const metadata: Metadata = {
  title: "GDPR Compliance - Pedagogist's PTE",
  description: "GDPR compliance information for European users",
}

export default function GDPRPage() {
  return (
    <article>
      <h1>GDPR Compliance</h1>
      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <h2>1. Introduction</h2>
      <p>
        For users in the European Economic Area (EEA), United Kingdom, and Switzerland, we comply with the General Data
        Protection Regulation (GDPR). This page explains your rights and how we protect your personal data.
      </p>

      <h2>2. Legal Basis for Processing</h2>
      <p>We process your personal data under the following legal bases:</p>

      <h3>2.1 Contract Performance</h3>
      <p>Processing necessary to provide our PTE practice services:</p>
      <ul>
        <li>Account creation and management</li>
        <li>Practice session processing and AI scoring</li>
        <li>Progress tracking and analytics</li>
      </ul>

      <h3>2.2 Legitimate Interest</h3>
      <p>Processing necessary for our legitimate business interests:</p>
      <ul>
        <li>Improving our AI algorithms</li>
        <li>Fraud prevention and security</li>
        <li>Customer support</li>
        <li>Marketing to existing customers</li>
      </ul>

      <h3>2.3 Consent</h3>
      <p>Processing based on your explicit consent:</p>
      <ul>
        <li>Marketing emails to prospects</li>
        <li>Optional analytics cookies</li>
        <li>Newsletter subscriptions</li>
      </ul>

      <h3>2.4 Legal Obligation</h3>
      <p>Processing required by law:</p>
      <ul>
        <li>Tax and accounting records</li>
        <li>Compliance with court orders</li>
        <li>Anti-money laundering checks</li>
      </ul>

      <h2>3. Your GDPR Rights</h2>

      <h3>3.1 Right to Access</h3>
      <p>
        You can request a copy of all personal data we hold about you. We'll provide this in a structured,
        machine-readable format (JSON or CSV).
      </p>

      <h3>3.2 Right to Rectification</h3>
      <p>
        You can correct inaccurate or incomplete personal data through your account settings or by contacting us.
      </p>

      <h3>3.3 Right to Erasure ("Right to be Forgotten")</h3>
      <p>
        You can request deletion of your personal data. We'll delete your data unless we have a legal obligation
        to retain it (e.g., financial records for 7 years).
      </p>

      <h3>3.4 Right to Restriction</h3>
      <p>
        You can request that we limit how we use your data while we verify accuracy or investigate your concerns.
      </p>

      <h3>3.5 Right to Data Portability</h3>
      <p>
        You can request your data in a portable format to transfer to another service. We provide data exports in JSON format.
      </p>

      <h3>3.6 Right to Object</h3>
      <p>
        You can object to processing based on legitimate interests or for direct marketing purposes.
      </p>

      <h3>3.7 Right to Withdraw Consent</h3>
      <p>
        You can withdraw consent at any time for processing based on consent (e.g., marketing emails).
      </p>

      <h3>3.8 Right to Lodge a Complaint</h3>
      <p>
        You can file a complaint with your local data protection authority if you believe we've violated GDPR.
      </p>

      <h2>4. How to Exercise Your Rights</h2>

      <h3>4.1 Self-Service Options</h3>
      <ul>
        <li><strong>Access/Update Data:</strong> Account Settings → Profile</li>
        <li><strong>Download Data:</strong> Account Settings → Privacy → Export Data</li>
        <li><strong>Delete Account:</strong> Account Settings → Privacy → Delete Account</li>
        <li><strong>Marketing Preferences:</strong> Account Settings → Notifications</li>
      </ul>

      <h3>4.2 Contact Us</h3>
      <p>For requests that cannot be completed through self-service:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:gdpr@pedagogistpte.com">gdpr@pedagogistpte.com</a></li>
        <li><strong>Subject Line:</strong> "GDPR Request - [Your Request Type]"</li>
        <li><strong>Include:</strong> Your registered email and specific request details</li>
      </ul>

      <h3>4.3 Response Time</h3>
      <p>We respond to GDPR requests within 30 days. For complex requests, we may extend this to 60 days with notification.</p>

      <h2>5. Data We Collect</h2>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-muted">
            <th className="border border-gray-300 px-4 py-2">Data Type</th>
            <th className="border border-gray-300 px-4 py-2">Purpose</th>
            <th className="border border-gray-300 px-4 py-2">Legal Basis</th>
            <th className="border border-gray-300 px-4 py-2">Retention</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Name, Email</td>
            <td className="border border-gray-300 px-4 py-2">Account management</td>
            <td className="border border-gray-300 px-4 py-2">Contract</td>
            <td className="border border-gray-300 px-4 py-2">Until deletion + 30 days</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Practice Data</td>
            <td className="border border-gray-300 px-4 py-2">Service delivery</td>
            <td className="border border-gray-300 px-4 py-2">Contract</td>
            <td className="border border-gray-300 px-4 py-2">Until deletion</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Audio Recordings</td>
            <td className="border border-gray-300 px-4 py-2">AI scoring</td>
            <td className="border border-gray-300 px-4 py-2">Contract</td>
            <td className="border border-gray-300 px-4 py-2">90 days</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payment Info</td>
            <td className="border border-gray-300 px-4 py-2">Billing</td>
            <td className="border border-gray-300 px-4 py-2">Contract + Legal</td>
            <td className="border border-gray-300 px-4 py-2">7 years</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Usage Analytics</td>
            <td className="border border-gray-300 px-4 py-2">Service improvement</td>
            <td className="border border-gray-300 px-4 py-2">Legitimate Interest</td>
            <td className="border border-gray-300 px-4 py-2">2 years</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Marketing Emails</td>
            <td className="border border-gray-300 px-4 py-2">Marketing</td>
            <td className="border border-gray-300 px-4 py-2">Consent</td>
            <td className="border border-gray-300 px-4 py-2">Until unsubscribe</td>
          </tr>
        </tbody>
      </table>

      <h2>6. International Data Transfers</h2>
      <p>
        Your data may be transferred to and processed in countries outside the EEA, including the United States.
        We ensure adequate safeguards through:
      </p>
      <ul>
        <li>Standard Contractual Clauses (SCCs) with third-party processors</li>
        <li>Adequacy decisions by the European Commission</li>
        <li>Binding Corporate Rules for multinational organizations</li>
      </ul>

      <h3>6.1 Third-Party Processors</h3>
      <ul>
        <li><strong>OpenAI (US):</strong> SCCs in place for AI processing</li>
        <li><strong>Google (US):</strong> Privacy Shield certified, SCCs in place</li>
        <li><strong>Vercel (US):</strong> SCCs and DPA available</li>
        <li><strong>Stripe (US/EU):</strong> PCI-DSS compliant, GDPR-compliant DPA</li>
      </ul>

      <h2>7. Data Protection Officer (DPO)</h2>
      <p>
        For data protection inquiries, you can contact our Data Protection Officer:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:dpo@pedagogistpte.com">dpo@pedagogistpte.com</a></li>
        <li><strong>Role:</strong> Oversee GDPR compliance and handle data protection requests</li>
      </ul>

      <h2>8. Data Breach Notification</h2>
      <p>
        In the event of a personal data breach that poses a risk to your rights and freedoms:
      </p>
      <ul>
        <li>We'll notify the relevant supervisory authority within 72 hours</li>
        <li>We'll notify affected users without undue delay</li>
        <li>Notification will include nature of breach, likely consequences, and mitigation measures</li>
      </ul>

      <h2>9. Children's Data</h2>
      <p>
        We do not knowingly process data of children under 16 without parental consent, as required by GDPR Article 8.
      </p>

      <h2>10. Automated Decision-Making</h2>
      <p>
        Our AI scoring system involves automated decision-making. However:
      </p>
      <ul>
        <li>AI scores are for practice purposes only, not legally binding decisions</li>
        <li>You can request human review of AI scoring results</li>
        <li>You can opt out of AI scoring and use manual scoring alternatives</li>
      </ul>

      <h2>11. Supervisory Authority</h2>
      <p>
        If you're not satisfied with our response to your GDPR request, you can lodge a complaint with:
      </p>
      <ul>
        <li>Your local data protection authority in the EEA</li>
        <li>The Irish Data Protection Commission (our lead supervisory authority)</li>
        <li>Find your authority: <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">EDPB Member List</a></li>
      </ul>

      <h2>12. Updates to GDPR Compliance</h2>
      <p>
        We regularly review and update our GDPR compliance measures. Material changes will be communicated via email
        and posted on this page.
      </p>

      <div className="mt-8 rounded-lg border bg-muted p-6">
        <h3 className="mb-2 text-lg font-semibold">Quick GDPR Summary</h3>
        <ul className="text-sm">
          <li>✅ Full GDPR compliance for EEA users</li>
          <li>✅ Easy data export and deletion through account settings</li>
          <li>✅ 30-day response time for GDPR requests</li>
          <li>✅ Standard Contractual Clauses for international transfers</li>
          <li>✅ Dedicated DPO for data protection inquiries</li>
        </ul>
      </div>
    </article>
  )
}
