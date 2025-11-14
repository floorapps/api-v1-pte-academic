import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility Statement - Pedagogist's PTE",
  description: "Our commitment to digital accessibility",
}

export default function AccessibilityPage() {
  return (
    <article>
      <h1>Accessibility Statement</h1>
      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <h2>1. Our Commitment</h2>
      <p>
        Pedagogist's PTE is committed to ensuring digital accessibility for people with disabilities. We continually
        improve the user experience for everyone and apply relevant accessibility standards.
      </p>

      <h2>2. Conformance Status</h2>
      <p>
        We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines help
        make web content more accessible for people with disabilities and user-friendly for everyone.
      </p>

      <h3>2.1 Partially Conformant</h3>
      <p>
        Pedagogist's PTE is partially conformant with WCAG 2.1 Level AA. This means some parts of the content do not
        fully conform to the accessibility standard. We are actively working to achieve full conformance.
      </p>

      <h2>3. Accessibility Features</h2>

      <h3>3.1 Keyboard Navigation</h3>
      <ul>
        <li>All interactive elements are accessible via keyboard</li>
        <li>Logical tab order throughout the platform</li>
        <li>Skip navigation links for screen reader users</li>
        <li>Keyboard shortcuts for common actions (Ctrl+K for search, etc.)</li>
      </ul>

      <h3>3.2 Screen Reader Support</h3>
      <ul>
        <li>Semantic HTML for proper structure</li>
        <li>ARIA labels and landmarks</li>
        <li>Alt text for images and icons</li>
        <li>Descriptive link text</li>
        <li>Form labels and error messages</li>
      </ul>

      <h3>3.3 Visual Design</h3>
      <ul>
        <li>High contrast mode support</li>
        <li>Adjustable text size (browser zoom support)</li>
        <li>Color contrast ratios meeting WCAG AA standards</li>
        <li>Information not conveyed by color alone</li>
        <li>Readable fonts (Manrope with clear letter spacing)</li>
      </ul>

      <h3>3.4 Theme Options</h3>
      <ul>
        <li>Light and dark mode for user preference</li>
        <li>System theme detection and auto-switching</li>
        <li>Reduced motion support (respects prefers-reduced-motion)</li>
      </ul>

      <h3>3.5 Multimedia</h3>
      <ul>
        <li>AI-generated transcripts for audio responses</li>
        <li>Adjustable playback speed for audio</li>
        <li>Captions for instructional videos (where available)</li>
        <li>Text alternatives for audio-only content</li>
      </ul>

      <h2>4. Known Limitations</h2>
      <p>
        Despite our best efforts, some limitations may exist:
      </p>

      <h3>4.1 Practice Features</h3>
      <ul>
        <li><strong>Speaking Tasks:</strong> Require microphone access (inherent to PTE exam format)</li>
        <li><strong>Listening Tasks:</strong> Require audio playback (inherent to PTE exam format)</li>
        <li><strong>Timed Tests:</strong> Fixed time limits (matching actual exam conditions)</li>
      </ul>

      <h3>4.2 Third-Party Content</h3>
      <ul>
        <li>Some third-party embedded content may not be fully accessible</li>
        <li>External links may lead to sites not under our control</li>
      </ul>

      <h2>5. Assistive Technologies</h2>
      <p>
        Pedagogist's PTE is designed to work with the following assistive technologies:
      </p>
      <ul>
        <li><strong>Screen Readers:</strong> JAWS, NVDA, VoiceOver, TalkBack</li>
        <li><strong>Browser Extensions:</strong> High contrast modes, text-to-speech</li>
        <li><strong>Operating System Tools:</strong> Magnification, voice control</li>
        <li><strong>Keyboard Navigation:</strong> Full keyboard support without mouse</li>
      </ul>

      <h2>6. Browser Compatibility</h2>
      <p>
        For the best accessibility experience, we recommend:
      </p>
      <ul>
        <li>Chrome 90+ with ChromeVox (screen reader)</li>
        <li>Firefox 88+ with NVDA (screen reader)</li>
        <li>Safari 14+ with VoiceOver (screen reader)</li>
        <li>Edge 90+ with Narrator (screen reader)</li>
      </ul>

      <h2>7. Accommodations for PTE Practice</h2>

      <h3>7.1 Extended Time</h3>
      <p>
        If you require extended time for practice (similar to official PTE accommodations):
      </p>
      <ul>
        <li>Contact us at <a href="mailto:accessibility@pedagogistpte.com">accessibility@pedagogistpte.com</a></li>
        <li>Provide documentation of your accommodation needs</li>
        <li>We'll adjust your account settings accordingly</li>
      </ul>

      <h3>7.2 Alternative Formats</h3>
      <p>
        If you need practice materials in alternative formats:
      </p>
      <ul>
        <li>Large print versions of text content</li>
        <li>Transcripts of audio content</li>
        <li>Simplified language explanations</li>
      </ul>

      <h2>8. Testing & Evaluation</h2>
      <p>
        We regularly test our accessibility through:
      </p>
      <ul>
        <li>Automated accessibility scanning (axe DevTools, WAVE)</li>
        <li>Manual testing with screen readers</li>
        <li>Keyboard-only navigation testing</li>
        <li>User feedback from people with disabilities</li>
        <li>Third-party accessibility audits (annual)</li>
      </ul>

      <h2>9. Ongoing Improvements</h2>
      <p>
        We're continuously working to improve accessibility:
      </p>

      <h3>Current Priorities:</h3>
      <ul>
        <li>Enhancing screen reader announcements for dynamic content</li>
        <li>Improving focus indicators throughout the platform</li>
        <li>Adding more keyboard shortcuts</li>
        <li>Expanding caption/transcript coverage</li>
        <li>Conducting regular accessibility audits</li>
      </ul>

      <h2>10. Feedback & Contact</h2>
      <p>
        We welcome feedback on the accessibility of Pedagogist's PTE. Please let us know if you encounter accessibility
        barriers:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:accessibility@pedagogistpte.com">accessibility@pedagogistpte.com</a></li>
        <li><strong>Subject:</strong> "Accessibility Feedback"</li>
        <li><strong>Include:</strong>
          <ul>
            <li>Page/feature where you encountered the issue</li>
            <li>Type of assistive technology you're using</li>
            <li>Description of the problem</li>
            <li>Suggested improvement (if applicable)</li>
          </ul>
        </li>
      </ul>

      <h3>Response Time</h3>
      <p>
        We aim to respond to accessibility feedback within 3 business days and address issues based on severity:
      </p>
      <ul>
        <li><strong>Critical:</strong> Blocks core functionality - within 48 hours</li>
        <li><strong>High:</strong> Significantly impacts usability - within 1 week</li>
        <li><strong>Medium:</strong> Partial impact - within 2 weeks</li>
        <li><strong>Low:</strong> Minor inconvenience - within 1 month</li>
      </ul>

      <h2>11. Legal Requirements</h2>
      <p>
        We comply with applicable accessibility laws and regulations, including:
      </p>
      <ul>
        <li>Americans with Disabilities Act (ADA) - US</li>
        <li>Section 508 of the Rehabilitation Act - US Federal</li>
        <li>European Accessibility Act (EAA) - EU</li>
        <li>Accessibility for Ontarians with Disabilities Act (AODA) - Canada</li>
      </ul>

      <h2>12. Third-Party Applications</h2>
      <p>
        We use third-party services that may have their own accessibility statements:
      </p>
      <ul>
        <li><strong>Stripe:</strong> <a href="https://stripe.com/accessibility" target="_blank" rel="noopener noreferrer">Stripe Accessibility</a></li>
        <li><strong>Vercel:</strong> <a href="https://vercel.com/legal/accessibility" target="_blank" rel="noopener noreferrer">Vercel Accessibility</a></li>
        <li><strong>OpenAI:</strong> <a href="https://openai.com/accessibility" target="_blank" rel="noopener noreferrer">OpenAI Accessibility</a></li>
      </ul>

      <h2>13. Updates to This Statement</h2>
      <p>
        We may update this Accessibility Statement from time to time to reflect changes in our accessibility practices
        or legal requirements. The "Last Updated" date at the top indicates when the statement was last revised.
      </p>

      <div className="mt-8 rounded-lg border bg-muted p-6">
        <h3 className="mb-2 text-lg font-semibold">Accessibility Quick Tips</h3>
        <ul className="text-sm">
          <li><strong>Keyboard Users:</strong> Use Tab to navigate, Enter to select, Escape to close dialogs</li>
          <li><strong>Screen Readers:</strong> Use heading navigation (H) to jump between sections</li>
          <li><strong>Visual Adjustments:</strong> Use browser zoom (Ctrl/Cmd +/-) or system accessibility settings</li>
          <li><strong>Motion Sensitivity:</strong> Enable "Reduce Motion" in your OS settings</li>
        </ul>
      </div>
    </article>
  )
}
