import { Copyright, Shield, AlertTriangle, FileText } from 'lucide-react'

export default function CopyrightPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Copyright className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">Copyright Policy</h1>
        </div>
        <p className="text-text-secondary text-lg">
          Protecting Intellectual Property Rights
        </p>
      </div>

      <div className="bg-success/10 border border-success/30 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-success flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">Artists Own Their Work</h3>
            <p className="text-sm text-text-secondary">
              Arena for Creatives respects intellectual property rights. All artwork submitted remains 
              the property of the original creator. We take copyright infringement seriously.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 prose prose-lg max-w-none">
        {/* Section 1 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">1.</span> Ownership of Content
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">1.1 Your Artwork</h3>
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
            <p className="text-text-secondary font-medium">
              <strong className="text-success">You retain full copyright</strong> to all artwork you create 
              and submit to Arena for Creatives. We do not claim ownership of your creative work.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-3">1.2 License You Grant Us</h3>
          <p className="text-text-secondary mb-2">
            By submitting artwork, you grant Arena for Creatives a limited, non-exclusive, 
            royalty-free license to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Display your artwork on the platform</li>
            <li>Include in contest galleries and voting</li>
            <li>Feature in winner announcements</li>
            <li>Use in promotional materials with attribution</li>
            <li>Store and process for platform functionality</li>
          </ul>
          <p className="text-text-secondary text-sm italic">
            This license is non-exclusive, meaning you can use your work anywhere else. 
            You can revoke this license by deleting your work from the platform.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">1.3 Platform Content</h3>
          <p className="text-text-secondary">
            All platform features, design, code, logos, and branding are owned by Arena for Creatives 
            and protected by copyright law. You may not copy, modify, or distribute platform content 
            without permission.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">2.</span> Submission Requirements
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">2.1 Original Work Only</h3>
          <p className="text-text-secondary mb-2">
            All submissions must be your original creation. You must:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Own the copyright to the work</li>
            <li>Have created the work yourself</li>
            <li>Not have copied or traced from others</li>
            <li>Have rights to use any reference materials</li>
            <li>Disclose any AI assistance or generation</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">2.2 Prohibited Content</h3>
          <div className="bg-error/10 border border-error/30 rounded-lg p-4">
            <p className="text-text-secondary mb-2">
              <strong className="text-error">You may NOT submit:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary text-sm">
              <li>Plagiarized or copied artwork</li>
              <li>Traced artwork without permission</li>
              <li>Work that infringes on others' copyrights</li>
              <li>Work that violates trademark rights</li>
              <li>Work containing unauthorized characters or IP</li>
              <li>Work you don't have rights to submit</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Fan Art and Derivative Works</h3>
          <p className="text-text-secondary mb-4">
            Fan art may be allowed depending on contest rules. However:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>You must clearly identify it as fan art</li>
            <li>Original copyright holders retain their rights</li>
            <li>Commercial use may be restricted</li>
            <li>Some contests may prohibit fan art</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">3.</span> Copyright Protection
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1 How We Protect Your Work</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>Attribution:</strong> Your name is always displayed with your work</li>
            <li><strong>Reduced Resolution:</strong> Display images are lower resolution than originals</li>
            <li><strong>Metadata:</strong> Copyright information embedded in images</li>
            <li><strong>Download Restrictions:</strong> Only you can download full resolution</li>
            <li><strong>Watermarking:</strong> Optional watermark feature (coming soon)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">3.2 Your Responsibilities</h3>
          <p className="text-text-secondary mb-2">
            To protect your work:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Add copyright notices to your images</li>
            <li>Keep original files with higher resolution</li>
            <li>Monitor for unauthorized use</li>
            <li>Report infringement promptly</li>
            <li>Consider registering important works</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            4. Reporting Copyright Infringement
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">4.1 If Your Work is Stolen</h3>
          <p className="text-text-secondary mb-4">
            If you believe someone has submitted your work without permission:
          </p>
          <div className="bg-background rounded-lg p-4 mb-4">
            <ol className="list-decimal list-inside space-y-3 text-text-secondary">
              <li>
                <strong>Gather Evidence:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Link to the infringing entry</li>
                  <li>Proof of your original work (dated files, posts, etc.)</li>
                  <li>Your contact information</li>
                </ul>
              </li>
              <li>
                <strong>Submit a DMCA Notice:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Email: dmca@artfightcontest.com</li>
                  <li>Or use our <a href="/dmca" className="text-primary hover:underline">DMCA Takedown Form</a></li>
                </ul>
              </li>
              <li>
                <strong>We Will Investigate:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Review within 24-48 hours</li>
                  <li>Remove if infringement confirmed</li>
                  <li>Notify the uploader</li>
                  <li>Take action against repeat offenders</li>
                </ul>
              </li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold mb-3">4.2 If You're Accused of Infringement</h3>
          <p className="text-text-secondary mb-2">
            If your work is removed for alleged infringement:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>You'll receive notification with details</li>
            <li>You can submit a counter-notice if you believe it's a mistake</li>
            <li>Provide proof of your ownership or rights</li>
            <li>We'll review and restore if appropriate</li>
          </ul>

          <div className="bg-error/10 border border-error/30 rounded-lg p-4">
            <p className="text-text-secondary text-sm">
              <strong className="text-error">Warning:</strong> Submitting false DMCA claims or 
              counter-notices may result in legal liability. Only file claims if you genuinely 
              believe infringement has occurred.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">5.</span> Consequences of Infringement
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">5.1 First Offense</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Entry removed immediately</li>
            <li>Warning issued to account</li>
            <li>Disqualification from contest</li>
            <li>Loss of any prizes or XP earned</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">5.2 Repeat Offenses</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Account suspension (temporary)</li>
            <li>Loss of all contest privileges</li>
            <li>Permanent ban for serious violations</li>
            <li>Possible legal action</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">5.3 Good Faith Mistakes</h3>
          <p className="text-text-secondary">
            We understand mistakes happen. If you accidentally submit work you don't have rights to, 
            contact us immediately. We'll work with you if you act in good faith.
          </p>
        </section>

        {/* Section 6 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">6.</span> AI-Generated Art
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">6.1 Disclosure Required</h3>
          <p className="text-text-secondary mb-4">
            If your artwork involves AI generation or assistance, you must:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Clearly disclose AI usage in your submission</li>
            <li>Specify which AI tools were used</li>
            <li>Describe your creative input and modifications</li>
            <li>Follow contest-specific AI rules</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">6.2 Copyright Considerations</h3>
          <p className="text-text-secondary mb-2">
            Note that AI-generated art has complex copyright implications:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Pure AI output may not be copyrightable</li>
            <li>Significant human modification may establish copyright</li>
            <li>Training data may contain copyrighted works</li>
            <li>Some contests may prohibit or limit AI art</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            7. Commercial Use
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1 Your Rights</h3>
          <p className="text-text-secondary mb-4">
            You retain all commercial rights to your work. You can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Sell prints or merchandise</li>
            <li>License to clients or publishers</li>
            <li>Use in your portfolio</li>
            <li>Publish in books or galleries</li>
            <li>Create derivative works</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">7.2 Platform Usage</h3>
          <p className="text-text-secondary mb-4">
            Arena for Creatives will NOT:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Sell your artwork</li>
            <li>Create merchandise without permission</li>
            <li>License your work to third parties</li>
            <li>Use commercially beyond platform promotion</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">8.</span> Contact Information
          </h2>
          <p className="text-text-secondary mb-4">
            For copyright-related questions or concerns:
          </p>
          <div className="bg-background rounded-lg p-4">
            <p className="text-text-secondary">
              <strong>Copyright Inquiries:</strong> copyright@arenafc.com<br />
              <strong>DMCA Notices:</strong> dmca@arenafc.com<br />
              <strong>DMCA Form:</strong> <a href="/dmca" className="text-primary hover:underline">/dmca</a><br />
              <strong>General Contact:</strong> <a href="/contact" className="text-primary hover:underline">/contact</a>
            </p>
          </div>
        </section>

        {/* Final Notice */}
        <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Our Commitment</h3>
              <p className="text-sm text-text-secondary">
                Arena for Creatives is committed to protecting the intellectual property rights of all 
                artists. We take copyright seriously and will act swiftly to address any infringement. 
                Together, we can maintain a fair and respectful creative community.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
