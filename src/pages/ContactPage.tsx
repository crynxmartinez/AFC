// @ts-nocheck
import { useState } from 'react'
import { contactApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Mail, Send, CheckCircle, Instagram, Twitter, Github, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ContactPage() {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await contactApi.submit({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: user?.id || null,
      })

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface rounded-2xl p-8 md:p-12 text-center border border-border">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Message Sent!</h1>
          <p className="text-text-secondary text-lg mb-8">
            Thank you for contacting us. We'll get back to you as soon as possible, 
            typically within 24-48 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
        <p className="text-xl text-text-secondary">
          Have questions? We're here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="your@email.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Contest Question">Contest Question</option>
                  <option value="Partnership">Partnership Opportunity</option>
                  <option value="Report Issue">Report an Issue</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              {error && (
                <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* Quick Links to FAQ */}
          <div className="bg-surface rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Before You Contact</h3>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Check our FAQ section for quick answers to common questions.
            </p>
            <Link
              to="/#faq"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium text-sm"
            >
              View FAQ →
            </Link>
          </div>

          {/* Contact Info */}
          <div className="bg-surface rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Contact Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary mb-1">Email</p>
                <a href="mailto:support@arenafc.com" className="text-primary hover:underline">
                  support@arenafc.com
                </a>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Response Time</p>
                <p className="font-medium">24-48 hours</p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-surface rounded-xl p-6 border border-border">
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-background hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-background hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-background hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
