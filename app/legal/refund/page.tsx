import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund Policy - Pedagogist's PTE",
  description: "Our refund and cancellation policy",
}

export default function RefundPolicyPage() {
  return (
    <article>
      <h1>Refund & Cancellation Policy</h1>
      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <h2>1. 14-Day Money-Back Guarantee</h2>
      <p>
        We offer a 14-day money-back guarantee for new subscribers. If you're not satisfied with our service within
        the first 14 days of your initial subscription, you can request a full refund.
      </p>

      <h3>1.1 Eligibility</h3>
      <ul>
        <li>Applies only to your first subscription (Pro or Premium plans)</li>
        <li>Request must be made within 14 days of initial purchase</li>
        <li>Does not apply to subscription renewals</li>
        <li>One refund per customer</li>
      </ul>

      <h2>2. Cancellation Policy</h2>

      <h3>2.1 How to Cancel</h3>
      <p>You can cancel your subscription anytime from:</p>
      <ul>
        <li>Account Settings → Billing → Cancel Subscription</li>
        <li>Or contact support at <a href="mailto:support@pedagogistpte.com">support@pedagogistpte.com</a></li>
      </ul>

      <h3>2.2 When Cancellation Takes Effect</h3>
      <ul>
        <li>Your subscription remains active until the end of your current billing period</li>
        <li>You will continue to have full access until the subscription expires</li>
        <li>No partial refunds for unused days in the current billing period</li>
        <li>You can reactivate your subscription anytime before it expires</li>
      </ul>

      <h2>3. Refund Requests</h2>

      <h3>3.1 How to Request a Refund</h3>
      <p>To request a refund within the 14-day window:</p>
      <ol>
        <li>Email <a href="mailto:billing@pedagogistpte.com">billing@pedagogistpte.com</a></li>
        <li>Include your account email and order number</li>
        <li>Provide brief reason for refund request (optional)</li>
      </ol>

      <h3>3.2 Refund Processing Time</h3>
      <ul>
        <li>Refund requests are processed within 3-5 business days</li>
        <li>Refunds are issued to the original payment method</li>
        <li>It may take 5-10 business days for the refund to appear in your account</li>
      </ul>

      <h2>4. Non-Refundable Items</h2>
      <p>The following are non-refundable:</p>
      <ul>
        <li>Subscription renewals (after 14 days from initial purchase)</li>
        <li>Annual subscriptions after 14 days</li>
        <li>Partial months or unused subscription time</li>
        <li>Third-party fees (payment processing fees)</li>
      </ul>

      <h2>5. Exceptions</h2>
      <p>Refunds may be denied if:</p>
      <ul>
        <li>Request is made after the 14-day window</li>
        <li>Account was terminated for Terms of Service violations</li>
        <li>Evidence of subscription abuse or fraud</li>
        <li>Request is for a renewal rather than initial purchase</li>
      </ul>

      <h2>6. Promo Codes & Discounts</h2>
      <ul>
        <li>If you used a promo code, refund amount reflects the discounted price paid</li>
        <li>Promo codes are non-transferable and cannot be refunded separately</li>
      </ul>

      <h2>7. Account Access After Refund</h2>
      <p>After a refund is issued:</p>
      <ul>
        <li>Your account will be downgraded to the Free plan</li>
        <li>Premium features will be disabled immediately</li>
        <li>Your practice history and data will be retained</li>
        <li>You can still access Free plan features</li>
      </ul>

      <h2>8. Technical Issues</h2>
      <p>
        If you experience technical problems that prevent you from using the service, please contact our support team
        before requesting a refund. We're committed to resolving issues and may extend your subscription if necessary.
      </p>

      <h2>9. Contact Us</h2>
      <p>For refund or cancellation questions:</p>
      <ul>
        <li><strong>Billing:</strong> <a href="mailto:billing@pedagogistpte.com">billing@pedagogistpte.com</a></li>
        <li><strong>Support:</strong> <a href="/contact">Contact Form</a></li>
      </ul>

      <div className="mt-8 rounded-lg border bg-muted p-6">
        <h3 className="mb-2 text-lg font-semibold">Quick Summary</h3>
        <ul className="text-sm">
          <li>✅ 14-day money-back guarantee on initial subscriptions</li>
          <li>✅ Cancel anytime with access until period ends</li>
          <li>❌ No refunds for renewals or partial months</li>
          <li>❌ Refunds processed within 3-5 business days</li>
        </ul>
      </div>
    </article>
  )
}
