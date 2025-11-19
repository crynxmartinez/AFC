import { Shield, Eye, Lock, Database, UserX } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-text-secondary text-lg">
          Last Updated: November 19, 2024
        </p>
      </div>

      <div className="bg-success/10 border border-success/30 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <Lock className="w-6 h-6 text-success flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">Your Privacy Matters</h3>
            <p className="text-sm text-text-secondary">
              We are committed to protecting your privacy. This policy explains what data we collect, 
              how we use it, and your rights regarding your personal information.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 prose prose-lg max-w-none">
        {/* Section 1 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            1. Information We Collect
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">1.1 Information You Provide</h3>
          <p className="text-text-secondary mb-2">When you create an account, we collect:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>Email address</strong> - For account creation and communication</li>
            <li><strong>Username</strong> - Your public display name</li>
            <li><strong>Display name</strong> - Optional full name</li>
            <li><strong>Profile information</strong> - Bio, avatar, cover photo (optional)</li>
            <li><strong>Social links</strong> - Instagram, Twitter, portfolio (optional)</li>
            <li><strong>Skills and specialties</strong> - For profile enhancement (optional)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">1.2 Content You Submit</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>Artwork submissions</strong> - Images uploaded to contests</li>
            <li><strong>Comments</strong> - Feedback on entries</li>
            <li><strong>Votes</strong> - Your contest voting activity</li>
            <li><strong>Contact messages</strong> - Support inquiries</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">1.3 Automatically Collected Data</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>Usage data</strong> - Pages visited, features used</li>
            <li><strong>Device information</strong> - Browser type, operating system</li>
            <li><strong>Timestamps</strong> - When you perform actions</li>
          </ul>

          <div className="bg-error/10 border border-error/30 rounded-lg p-4 mt-4">
            <h4 className="font-bold mb-2 text-error">What We DON'T Collect:</h4>
            <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
              <li>IP addresses (not stored in database)</li>
              <li>Physical location or GPS data</li>
              <li>Device fingerprints</li>
              <li>Browsing history outside our platform</li>
              <li>Third-party tracking cookies</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            2. How We Use Your Information
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">2.1 Platform Functionality</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Create and manage your account</li>
            <li>Display your profile and artwork</li>
            <li>Process contest submissions and voting</li>
            <li>Calculate rankings and award prizes</li>
            <li>Enable social features (follow, comment, like)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">2.2 Communication</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Send notifications (votes, comments, follows)</li>
            <li>Respond to support inquiries</li>
            <li>Announce contest results</li>
            <li>Send important platform updates</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">2.3 Platform Improvement</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Analyze usage patterns to improve features</li>
            <li>Identify and fix technical issues</li>
            <li>Understand user preferences</li>
            <li>Develop new features</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">2.4 Safety and Security</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Prevent fraud and abuse</li>
            <li>Detect plagiarism and rule violations</li>
            <li>Enforce terms of service</li>
            <li>Protect user accounts</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">3.</span> Information Sharing
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1 Public Information</h3>
          <p className="text-text-secondary mb-2">The following is visible to all users:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Username and display name</li>
            <li>Profile information (bio, avatar, cover photo)</li>
            <li>Submitted artwork and contest entries</li>
            <li>Comments and votes</li>
            <li>Achievements and badges</li>
            <li>Follower/following counts</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">3.2 Private Information</h3>
          <p className="text-text-secondary mb-2">The following is kept private:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Email address</li>
            <li>Password (encrypted)</li>
            <li>Contact form submissions</li>
            <li>Private messages (if implemented)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">3.3 Third-Party Sharing</h3>
          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <p className="text-text-secondary font-medium">
              <strong className="text-success">We do NOT sell your data.</strong> We only share information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary mt-3 text-sm">
              <li><strong>Supabase</strong> - Our database and authentication provider</li>
              <li><strong>Email service</strong> - For sending notifications (if configured)</li>
              <li><strong>Legal authorities</strong> - If required by law</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <UserX className="w-6 h-6 text-primary" />
            4. Your Rights and Choices
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">4.1 Access and Control</h3>
          <p className="text-text-secondary mb-2">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>Access your data</strong> - View all information we have about you</li>
            <li><strong>Update information</strong> - Edit your profile anytime</li>
            <li><strong>Delete content</strong> - Remove artwork, comments, or entries</li>
            <li><strong>Delete account</strong> - Permanently remove your account and data</li>
            <li><strong>Export data</strong> - Download your information</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">4.2 Notification Preferences</h3>
          <p className="text-text-secondary mb-2">Control what notifications you receive:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Vote notifications</li>
            <li>Comment notifications</li>
            <li>Follow notifications</li>
            <li>Contest announcements</li>
          </ul>
          <p className="text-text-secondary text-sm">
            Manage preferences in <a href="/settings" className="text-primary hover:underline">Settings</a>
          </p>

          <h3 className="text-xl font-semibold mb-3">4.3 Account Deletion</h3>
          <p className="text-text-secondary mb-2">
            When you delete your account:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Your profile is permanently removed</li>
            <li>Your artwork is deleted from contests</li>
            <li>Your comments are anonymized or removed</li>
            <li>Your email is removed from our system</li>
            <li>This action cannot be undone</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">5.</span> Data Security
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">5.1 Security Measures</h3>
          <p className="text-text-secondary mb-2">We protect your data with:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>HTTPS encryption</strong> - All data transmitted securely</li>
            <li><strong>Password hashing</strong> - Passwords are never stored in plain text</li>
            <li><strong>Row Level Security (RLS)</strong> - Database access controls</li>
            <li><strong>Regular backups</strong> - Data recovery capabilities</li>
            <li><strong>Secure authentication</strong> - Powered by Supabase Auth</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">5.2 Your Responsibility</h3>
          <p className="text-text-secondary mb-2">Help keep your account secure:</p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Use a strong, unique password</li>
            <li>Don't share your login credentials</li>
            <li>Log out on shared devices</li>
            <li>Report suspicious activity immediately</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">6.</span> Cookies and Tracking
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">6.1 Essential Cookies</h3>
          <p className="text-text-secondary mb-4">
            We use essential cookies for authentication and session management. These are 
            necessary for the platform to function and cannot be disabled.
          </p>

          <h3 className="text-xl font-semibold mb-3">6.2 Analytics</h3>
          <p className="text-text-secondary">
            We currently do not use third-party analytics or tracking cookies. If we add 
            analytics in the future, we will update this policy and use privacy-focused solutions.
          </p>
        </section>

        {/* Section 7 - Data Retention */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">7.</span> Data Retention
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1 How Long We Keep Your Data</h3>
          <p className="text-text-secondary mb-4">
            We retain your personal information only as long as necessary for the purposes outlined 
            in this Privacy Policy:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
            <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days of account deletion</li>
            <li><strong>Artwork:</strong> Removed immediately upon deletion or account closure</li>
            <li><strong>Comments:</strong> May be anonymized instead of deleted to preserve discussions</li>
            <li><strong>Contest Results:</strong> Historical data kept for leaderboard integrity</li>
            <li><strong>Legal Requirements:</strong> Some data retained longer if required by law</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">7.2 Backup and Recovery</h3>
          <p className="text-text-secondary mb-4">
            We maintain secure backups of our database for disaster recovery. Deleted data may 
            persist in backups for up to 90 days before being permanently purged.
          </p>

          <h3 className="text-xl font-semibold mb-3">7.3 Inactive Accounts</h3>
          <p className="text-text-secondary">
            Accounts inactive for more than 3 years may be archived or deleted after email 
            notification. You can prevent this by logging in periodically.
          </p>
        </section>

        {/* Section 8 - Data Breach Notification */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">8.</span> Data Breach Notification
          </h2>
          
          <h3 className="text-xl font-semibold mb-3">8.1 Our Commitment</h3>
          <p className="text-text-secondary mb-4">
            We take data security seriously and have implemented multiple layers of protection. 
            However, no system is 100% secure.
          </p>

          <h3 className="text-xl font-semibold mb-3">8.2 In Case of a Breach</h3>
          <p className="text-text-secondary mb-2">
            If a data breach occurs that may affect your personal information, we will:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Investigate and contain the breach immediately</li>
            <li>Notify affected users within 72 hours via email</li>
            <li>Provide details about what data was compromised</li>
            <li>Explain steps we're taking to prevent future breaches</li>
            <li>Offer guidance on protecting your account</li>
            <li>Notify relevant authorities as required by law</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">8.3 Your Actions</h3>
          <p className="text-text-secondary">
            If you suspect unauthorized access to your account, change your password immediately 
            and contact us at <a href="mailto:security@arenafc.com" className="text-primary hover:underline">security@arenafc.com</a>
          </p>
        </section>

        {/* Section 9 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">9.</span> Children's Privacy
          </h2>
          <p className="text-text-secondary mb-4">
            Users must be at least 13 years old to use Arena for Creatives. We do not knowingly 
            collect information from children under 13. If we discover that a child under 13 has 
            provided personal information, we will delete it immediately.
          </p>
          <p className="text-text-secondary">
            Parents or guardians who believe their child has provided information should contact 
            us immediately at <a href="mailto:privacy@arenafc.com" className="text-primary hover:underline">privacy@arenafc.com</a>
          </p>
        </section>

        {/* Section 10 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">10.</span> International Users
          </h2>
          <p className="text-text-secondary mb-4">
            Arena for Creatives is operated from the Philippines. If you access the platform from 
            outside the Philippines, your information may be transferred to and processed in the 
            Philippines.
          </p>
          <p className="text-text-secondary">
            By using the platform, you consent to the transfer and processing of your information 
            in accordance with this Privacy Policy.
          </p>
        </section>

        {/* Section 11 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">11.</span> Changes to This Policy
          </h2>
          <p className="text-text-secondary mb-4">
            We may update this Privacy Policy from time to time. We will notify you of significant 
            changes by:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary mb-4">
            <li>Posting the new policy on this page</li>
            <li>Updating the "Last Updated" date</li>
            <li>Sending an email notification (for major changes)</li>
            <li>Displaying a notice on the platform</li>
          </ul>
          <p className="text-text-secondary">
            Continued use of the platform after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* Section 12 */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-primary">12.</span> Contact Us
          </h2>
          <p className="text-text-secondary mb-4">
            If you have questions about this Privacy Policy or how we handle your data:
          </p>
          <div className="bg-background rounded-lg p-4">
            <p className="text-text-secondary">
              <strong>Privacy Email:</strong> privacy@artfightcontest.com<br />
              <strong>General Contact:</strong> <a href="/contact" className="text-primary hover:underline">/contact</a><br />
              <strong>Data Requests:</strong> Email us to access, update, or delete your data
            </p>
          </div>
        </section>

        {/* GDPR/CCPA Notice */}
        <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
          <h3 className="font-bold mb-3">Your Privacy Rights</h3>
          <p className="text-sm text-text-secondary mb-3">
            Depending on your location, you may have additional rights under GDPR (Europe) or 
            CCPA (California):
          </p>
          <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
            <li>Right to access your personal data</li>
            <li>Right to rectification (correction)</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
          </ul>
          <p className="text-sm text-text-secondary mt-3">
            To exercise these rights, contact us at privacy@artfightcontest.com
          </p>
        </section>
      </div>
    </div>
  )
}
