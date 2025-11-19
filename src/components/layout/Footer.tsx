import { Link } from 'react-router-dom'
import { Palette, Instagram, Twitter, Github, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Palette className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Arena for Creatives</span>
            </Link>
            <p className="text-text-secondary text-sm mb-4">
              A competitive platform for artists to showcase their skills, compete for prizes, and grow their creative abilities.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-background hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-background hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-background hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/contests" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Active Contests
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Artists
                </Link>
              </li>
              <li>
                <Link to="/winners" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Winners
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/copyright" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-bold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/feed" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  My Feed
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Search
                </Link>
              </li>
              <li>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Discord Community
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Guidelines
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            © {currentYear} Arena for Creatives. All rights reserved.
          </p>
          <p className="text-text-secondary text-sm">
            Built with ❤️ for the artist community
          </p>
        </div>
      </div>
    </footer>
  )
}
