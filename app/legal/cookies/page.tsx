import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy - Pedagogist's PTE",
  description: "Information about how we use cookies and tracking technologies",
}

export default function CookiePolicyPage() {
  return (
    <article>
      <h1>Cookie Policy</h1>
      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are placed on your device when you visit our website. They help us provide you
        with a better experience by remembering your preferences and understanding how you use our Platform.
      </p>

      <h2>2. Types of Cookies We Use</h2>

      <h3>2.1 Essential Cookies</h3>
      <p>
        These cookies are necessary for the Platform to function and cannot be disabled:
      </p>
      <ul>
        <li><strong>Authentication:</strong> Keep you logged in to your account</li>
        <li><strong>Security:</strong> Protect against fraudulent activity</li>
        <li><strong>Session Management:</strong> Remember your actions during a browsing session</li>
      </ul>

      <h3>2.2 Performance Cookies</h3>
      <p>
        These cookies help us understand how visitors interact with our Platform:
      </p>
      <ul>
        <li><strong>Analytics:</strong> Track page views, session duration, and user journeys</li>
        <li><strong>Error Tracking:</strong> Identify and fix technical issues</li>
        <li><strong>Load Performance:</strong> Measure page load times and optimize performance</li>
      </ul>

      <h3>2.3 Functional Cookies</h3>
      <p>
        These cookies enable enhanced functionality and personalization:
      </p>
      <ul>
        <li><strong>Preferences:</strong> Remember your theme (light/dark mode), language, and settings</li>
        <li><strong>Progress Tracking:</strong> Save your practice session progress</li>
        <li><strong>Personalization:</strong> Customize content based on your study goals</li>
      </ul>

      <h3>2.4 Marketing Cookies</h3>
      <p>
        These cookies are used to deliver relevant advertising:
      </p>
      <ul>
        <li><strong>Advertising:</strong> Show you relevant ads on other websites</li>
        <li><strong>Retargeting:</strong> Remind you about our Platform after you leave</li>
        <li><strong>Conversion Tracking:</strong> Measure the effectiveness of our marketing campaigns</li>
      </ul>

      <h2>3. Third-Party Cookies</h2>
      <p>
        Some cookies are placed by third-party services we use:
      </p>
      <ul>
        <li><strong>Vercel Analytics:</strong> Website performance and usage analytics</li>
        <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
        <li><strong>Better Auth:</strong> OAuth authentication with Google, GitHub, etc.</li>
        <li><strong>OpenAI/Google:</strong> AI service integration</li>
      </ul>

      <h2>4. Local Storage and Session Storage</h2>
      <p>
        In addition to cookies, we use browser storage technologies:
      </p>
      <ul>
        <li><strong>LocalStorage:</strong> Store user preferences, practice history, and cached data</li>
        <li><strong>SessionStorage:</strong> Temporarily store data during your browsing session</li>
        <li><strong>IndexedDB:</strong> Store larger datasets for offline functionality</li>
      </ul>

      <h2>5. How Long Do Cookies Last?</h2>
      <ul>
        <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
        <li><strong>Persistent Cookies:</strong> Remain on your device for a set period:
          <ul>
            <li>Authentication: Up to 30 days</li>
            <li>Preferences: Up to 1 year</li>
            <li>Analytics: Up to 2 years</li>
          </ul>
        </li>
      </ul>

      <h2>6. Managing Cookies</h2>

      <h3>6.1 Browser Settings</h3>
      <p>
        Most browsers allow you to control cookies through settings:
      </p>
      <ul>
        <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
        <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
        <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
        <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
      </ul>

      <h3>6.2 Opt-Out Options</h3>
      <p>
        You can opt out of certain types of cookies:
      </p>
      <ul>
        <li><strong>Marketing Cookies:</strong> Adjust preferences in your account settings</li>
        <li><strong>Analytics:</strong> Use browser extensions like Privacy Badger or uBlock Origin</li>
        <li><strong>Do Not Track:</strong> Enable "Do Not Track" in your browser settings</li>
      </ul>

      <h3>6.3 Impact of Disabling Cookies</h3>
      <p>
        Disabling certain cookies may affect your experience:
      </p>
      <ul>
        <li>You may need to log in every time you visit</li>
        <li>Your preferences and settings won't be saved</li>
        <li>Some features may not work properly</li>
        <li>Page load times may increase</li>
      </ul>

      <h2>7. Cookies We Use in Detail</h2>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-muted">
            <th className="border border-gray-300 px-4 py-2">Cookie Name</th>
            <th className="border border-gray-300 px-4 py-2">Purpose</th>
            <th className="border border-gray-300 px-4 py-2">Duration</th>
            <th className="border border-gray-300 px-4 py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2"><code>auth-session</code></td>
            <td className="border border-gray-300 px-4 py-2">Keeps you logged in</td>
            <td className="border border-gray-300 px-4 py-2">30 days</td>
            <td className="border border-gray-300 px-4 py-2">Essential</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2"><code>theme</code></td>
            <td className="border border-gray-300 px-4 py-2">Remembers light/dark mode</td>
            <td className="border border-gray-300 px-4 py-2">1 year</td>
            <td className="border border-gray-300 px-4 py-2">Functional</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2"><code>csrf_token</code></td>
            <td className="border border-gray-300 px-4 py-2">Security protection</td>
            <td className="border border-gray-300 px-4 py-2">Session</td>
            <td className="border border-gray-300 px-4 py-2">Essential</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2"><code>_vercel_analytics</code></td>
            <td className="border border-gray-300 px-4 py-2">Website analytics</td>
            <td className="border border-gray-300 px-4 py-2">2 years</td>
            <td className="border border-gray-300 px-4 py-2">Performance</td>
          </tr>
        </tbody>
      </table>

      <h2>8. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated
        "Last Updated" date.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about our use of cookies:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:privacy@pedagogistpte.com">privacy@pedagogistpte.com</a></li>
        <li><strong>Support:</strong> <a href="/contact">Contact Form</a></li>
      </ul>

      <div className="mt-8 rounded-lg border bg-muted p-6">
        <h3 className="mb-2 text-lg font-semibold">Quick Summary</h3>
        <p className="text-sm">
          We use cookies to improve your experience, keep you logged in, and understand how you use our Platform.
          You can manage cookies through your browser settings, but disabling some cookies may affect functionality.
        </p>
      </div>
    </article>
  )
}
