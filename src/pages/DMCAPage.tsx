import { Shield, AlertTriangle, FileText, Mail } from 'lucide-react'

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">DMCA Policy</h1>
        </div>
        <p className="text-text-secondary text-lg">
          Digital Millennium Copyright Act Compliance
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">Quick Summary</h3>
            <p className="text-sm text-text-secondary">
              If your copyrighted work has been posted without permission, you can file a DMCA takedown 
              notice. We'll investigate and remove infringing content promptly.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 prose prose-lg max-w-none">
        {/* Section 1 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">1.</span> DMCA Compliance
          </h2>
          <p className="text-text-secondary mb-4">
            Arena for Creatives complies with the Digital Millennium Copyright Act (DMCA). We respect 
            the intellectual property rights of others and expect our users to do the same.
          </p>
          <p className="text-text-secondary">
            If you believe that content on our platform infringes your copyright, you may submit a 
            DMCA takedown notice as described below.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">2.</span> Filing a DMCA Takedown Notice
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">2.1 Required Information</h3>
          <p className="text-text-secondary mb-4">
            To file a valid DMCA notice, you must provide:
          </p>
          
          <div className="bg-background rounded-lg p-4 mb-4">
            <ol className="list-decimal list-inside space-y-3 text-text-secondary">
              <li>
                <strong>Your Contact Information:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Full legal name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Mailing address</li>
                </ul>
              </li>
              <li>
                <strong>Identification of Copyrighted Work:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Description of your original work</li>
                  <li>Link to your original work (if available online)</li>
                  <li>Proof of ownership (dated files, registration, etc.)</li>
                </ul>
              </li>
              <li>
                <strong>Identification of Infringing Material:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Direct URL to the infringing entry on our platform</li>
                  <li>Screenshot or description of the infringement</li>
                  <li>Specific location on the page</li>
                </ul>
              </li>
              <li>
                <strong>Good Faith Statement:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>"I have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law."</li>
                </ul>
              </li>
              <li>
                <strong>Accuracy Statement:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>"The information in this notification is accurate, and under penalty of perjury, I am the copyright owner or authorized to act on behalf of the owner."</li>
                </ul>
              </li>
              <li>
                <strong>Physical or Electronic Signature:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Type your full legal name</li>
                  <li>Or attach a scanned signature</li>
                </ul>
              </li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold mb-3">2.2 Where to Send</h3>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-text-secondary mb-3">
              <strong>DMCA Agent Contact:</strong>
            </p>
            <div className="space-y-2 text-text-secondary text-sm">
              <p><strong>Email:</strong> dmca@arenafc.com</p>
              <p><strong>Subject Line:</strong> "DMCA Takedown Notice"</p>
              <p><strong>Response Time:</strong> 24-48 hours</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">3.</span> Our Response Process
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1 Upon Receiving a Valid Notice</h3>
          <p className="text-text-secondary mb-2">
            When we receive a complete and valid DMCA notice, we will:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-text-secondary mb-4">
            <li>Acknowledge receipt of your notice</li>
            <li>Review the claim for validity</li>
            <li>Remove or disable access to the allegedly infringing material</li>
            <li>Notify the user who posted the content</li>
            <li>Document the takedown in our records</li>
          </ol>

          <h3 className="text-xl font-semibold mb-3">3.2 Timeline</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li><strong>Review:</strong> Within 24-48 hours of receipt</li>
            <li><strong>Action:</strong> Immediate removal if claim is valid</li>
            <li><strong>Notification:</strong> User notified within 24 hours</li>
            <li><strong>Counter-Notice Period:</strong> 10-14 business days</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">4.</span> Counter-Notification
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">4.1 If Your Content Was Removed</h3>
          <p className="text-text-secondary mb-4">
            If you believe your content was removed by mistake or misidentification, you may file 
            a counter-notification.
          </p>

          <h3 className="text-xl font-semibold mb-3">4.2 Counter-Notice Requirements</h3>
          <p className="text-text-secondary mb-2">
            Your counter-notice must include:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-text-secondary mb-4">
            <li>Your contact information (name, address, phone, email)</li>
            <li>Identification of the removed material and its location</li>
            <li>Statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
            <li>Consent to jurisdiction of federal court</li>
            <li>Your physical or electronic signature</li>
          </ol>

          <h3 className="text-xl font-semibold mb-3">4.3 Counter-Notice Process</h3>
          <p className="text-text-secondary mb-2">
            After receiving a valid counter-notice:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-text-secondary">
            <li>We forward it to the original complainant</li>
            <li>Wait 10-14 business days</li>
            <li>If no legal action is filed, we may restore the content</li>
            <li>You'll be notified of the outcome</li>
          </ol>
        </section>

        {/* Section 5 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            5. Repeat Infringer Policy
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">5.1 Three-Strike System</h3>
          <p className="text-text-secondary mb-2">
            We maintain a repeat infringer policy:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>First Strike:</strong> Warning + content removal</li>
            <li><strong>Second Strike:</strong> Temporary suspension (30 days)</li>
            <li><strong>Third Strike:</strong> Permanent account termination</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">5.2 Serious Violations</h3>
          <p className="text-text-secondary">
            Egregious or intentional infringement may result in immediate permanent ban, 
            regardless of prior history.
          </p>
        </section>

        {/* Section 6 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">6.</span> False Claims
          </h2>
          
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-4">
            <p className="text-text-secondary mb-2">
              <strong className="text-error">Warning:</strong> Filing false DMCA claims is illegal and may result in:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
              <li>Legal liability for damages</li>
              <li>Attorney's fees and court costs</li>
              <li>Perjury charges</li>
              <li>Ban from our platform</li>
            </ul>
          </div>

          <p className="text-text-secondary">
            Only file a DMCA notice if you genuinely believe your copyright has been infringed. 
            Do not use DMCA as a tool for harassment or censorship.
          </p>
        </section>

        {/* Section 7 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">7.</span> Limitations
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1 What DMCA Covers</h3>
          <p className="text-text-secondary mb-2">
            DMCA applies to copyright infringement only. It does NOT cover:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Trademark disputes</li>
            <li>Patent issues</li>
            <li>Defamation or libel</li>
            <li>Privacy violations</li>
            <li>Terms of service violations</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">7.2 Alternative Reporting</h3>
          <p className="text-text-secondary">
            For non-copyright issues, please use our <a href="/contact" className="text-primary hover:underline">Contact Form</a> or 
            report through the platform's reporting features.
          </p>
        </section>

        {/* Section 8 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            8. Contact Information
          </h2>
          
          <div className="bg-background rounded-lg p-4 mb-4">
            <h4 className="font-bold mb-3">DMCA Agent:</h4>
            <div className="space-y-2 text-text-secondary">
              <p><strong>Email:</strong> dmca@arenafc.com</p>
              <p><strong>Subject:</strong> "DMCA Takedown Notice" or "DMCA Counter-Notice"</p>
              <p><strong>Response Time:</strong> 24-48 hours</p>
            </div>
          </div>

          <div className="bg-background rounded-lg p-4">
            <h4 className="font-bold mb-3">Other Copyright Inquiries:</h4>
            <div className="space-y-2 text-text-secondary">
              <p><strong>General Copyright:</strong> copyright@arenafc.com</p>
              <p><strong>Contact Form:</strong> <a href="/contact" className="text-primary hover:underline">/contact</a></p>
              <p><strong>Copyright Policy:</strong> <a href="/copyright" className="text-primary hover:underline">/copyright</a></p>
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">9.</span> Additional Resources
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">Learn More About DMCA</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>
              <a href="https://www.copyright.gov/legislation/dmca.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Official DMCA Text (U.S. Copyright Office)
              </a>
            </li>
            <li>
              <a href="https://www.copyright.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                U.S. Copyright Office
              </a>
            </li>
            <li>
              <a href="/copyright" className="text-primary hover:underline">
                Our Copyright Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>
            </li>
          </ul>
        </section>

        {/* Final Notice */}
        <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Our Commitment</h3>
              <p className="text-sm text-text-secondary">
                Arena for Creatives takes copyright infringement seriously. We will respond promptly 
                to valid DMCA notices and work to maintain a platform that respects intellectual 
                property rights. If you have questions about this policy, please contact us.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
