import { FileText, Shield, AlertCircle } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-text-secondary text-lg">
          Last Updated: November 19, 2024
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">Important Notice</h3>
            <p className="text-sm text-text-secondary">
              By using Art Fight Contest, you agree to these terms. Please read them carefully. 
              If you don't agree, please don't use our platform.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 prose prose-lg max-w-none">
        {/* Section 1 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">1.</span> Acceptance of Terms
          </h2>
          <p className="text-text-secondary mb-4">
            By accessing and using Art Fight Contest ("the Platform"), you accept and agree to be bound by 
            these Terms of Service. These terms apply to all users, including artists, voters, and visitors.
          </p>
          <p className="text-text-secondary">
            We reserve the right to modify these terms at any time. Continued use of the Platform after 
            changes constitutes acceptance of the modified terms.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">2.</span> User Accounts
          </h2>
          <h3 className="text-xl font-semibold mb-3">2.1 Account Creation</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>You must be at least 13 years old to create an account</li>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>One person may not maintain multiple accounts</li>
            <li>You must not share your account credentials</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">2.2 Account Termination</h3>
          <p className="text-text-secondary mb-2">
            We reserve the right to suspend or terminate accounts that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Violate these terms</li>
            <li>Engage in fraudulent activity</li>
            <li>Submit plagiarized content</li>
            <li>Harass or abuse other users</li>
            <li>Attempt to manipulate voting or contests</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">3.</span> Intellectual Property Rights
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1 Your Content Ownership</h3>
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
            <p className="text-text-secondary font-medium">
              <strong className="text-success">You retain full ownership</strong> of all artwork and content you submit. 
              We do not claim any ownership rights to your creative work.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-3">3.2 License Grant</h3>
          <p className="text-text-secondary mb-2">
            By uploading content, you grant Art Fight Contest a non-exclusive, royalty-free, 
            worldwide license to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Display your artwork on the Platform</li>
            <li>Include in contest galleries and voting systems</li>
            <li>Use in promotional materials (with attribution)</li>
            <li>Feature in winner announcements and showcases</li>
            <li>Store and process for Platform functionality</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">3.3 Your Rights</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>You can delete your work at any time</li>
            <li>You can use your work elsewhere (non-exclusive)</li>
            <li>You will always be credited as the creator</li>
            <li>We will never sell your artwork without permission</li>
            <li>You can request removal from promotional materials</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">3.4 Platform Content</h3>
          <p className="text-text-secondary">
            All Platform features, design, code, and branding are owned by Art Fight Contest. 
            You may not copy, modify, or distribute any Platform content without permission.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">4.</span> Content Guidelines
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">4.1 Acceptable Content</h3>
          <p className="text-text-secondary mb-2">All submitted artwork must:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Be your original creation</li>
            <li>Not infringe on others' intellectual property</li>
            <li>Comply with contest themes and rules</li>
            <li>Be appropriate for a general audience</li>
            <li>Not contain malicious code or viruses</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">4.2 Prohibited Content</h3>
          <p className="text-text-secondary mb-2">You may not submit content that:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Is plagiarized or traced from others' work</li>
            <li>Contains hate speech or discriminatory material</li>
            <li>Depicts illegal activities</li>
            <li>Violates copyright or trademark rights</li>
            <li>Contains explicit adult content (unless specified in contest)</li>
            <li>Harasses or targets individuals</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">4.3 AI-Generated Art</h3>
          <p className="text-text-secondary">
            AI-assisted or AI-generated artwork must be clearly disclosed. Contests may have 
            specific rules regarding AI art participation.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">5.</span> Contest Rules
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">5.1 Participation</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>All users can participate in contests</li>
            <li>Follow specific contest rules and themes</li>
            <li>Submit work before deadlines</li>
            <li>One entry per user per contest (unless specified)</li>
            <li>Entries must be submitted through all 4 phases</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">5.2 Voting</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>One vote per entry per user</li>
            <li>No vote manipulation or fraud</li>
            <li>Votes are final once cast</li>
            <li>Vote brigading is prohibited</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">5.3 Prizes</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Winners determined by community votes</li>
            <li>Prizes awarded as platform points or specified rewards</li>
            <li>Prize amounts listed on contest pages</li>
            <li>Winners may be featured in promotional materials</li>
            <li>Prizes are non-transferable</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">6.</span> User Conduct
          </h2>
          <p className="text-text-secondary mb-2">Users must:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Treat all community members with respect</li>
            <li>Provide constructive feedback in comments</li>
            <li>Report violations to moderators</li>
            <li>Not engage in harassment or bullying</li>
            <li>Not spam or post irrelevant content</li>
            <li>Not attempt to hack or exploit the Platform</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">7.</span> Disclaimers
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1 Platform Availability</h3>
          <p className="text-text-secondary mb-4">
            The Platform is provided "as is" without warranties. We don't guarantee uninterrupted 
            access and may perform maintenance without notice.
          </p>

          <h3 className="text-xl font-semibold mb-3">7.2 User Content</h3>
          <p className="text-text-secondary mb-4">
            We are not responsible for user-submitted content. Users are solely responsible for 
            their submissions and interactions.
          </p>

          <h3 className="text-xl font-semibold mb-3">7.3 Third-Party Links</h3>
          <p className="text-text-secondary">
            The Platform may contain links to external websites. We are not responsible for 
            third-party content or practices.
          </p>
        </section>

        {/* Section 8 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">8.</span> Limitation of Liability
          </h2>
          <p className="text-text-secondary">
            To the maximum extent permitted by law, Art Fight Contest shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages resulting from your 
            use of the Platform.
          </p>
        </section>

        {/* Section 9 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">9.</span> Contact Information
          </h2>
          <p className="text-text-secondary mb-4">
            For questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-background rounded-lg p-4">
            <p className="text-text-secondary">
              <strong>Email:</strong> legal@artfightcontest.com<br />
              <strong>Contact Page:</strong> <a href="/contact" className="text-primary hover:underline">/contact</a>
            </p>
          </div>
        </section>

        {/* Agreement */}
        <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Agreement</h3>
              <p className="text-sm text-text-secondary">
                By using Art Fight Contest, you acknowledge that you have read, understood, and 
                agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
