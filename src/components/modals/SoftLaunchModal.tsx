import { useState, useEffect } from 'react'
import { X, Sparkles, Calendar, TestTube, Users } from 'lucide-react'

export default function SoftLaunchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the modal
    const dismissed = localStorage.getItem('softLaunchModalDismissed')
    const dismissedTime = localStorage.getItem('softLaunchModalDismissedTime')
    
    if (dismissed === 'true' && dismissedTime) {
      const dismissedDate = new Date(dismissedTime)
      const now = new Date()
      const hoursSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60)
      
      // Show again after 24 hours
      if (hoursSinceDismissed < 24) {
        return
      }
    }
    
    // Show modal after 1 second delay
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('softLaunchModalDismissed', 'true')
      localStorage.setItem('softLaunchModalDismissedTime', new Date().toISOString())
    }
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-40 overflow-hidden flex-shrink-0">
          <img
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Creative workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
          
          {/* Floating Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-primary/90 backdrop-blur-sm rounded-full border border-primary">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold">Soft Launch</span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 -mt-12 relative z-10">
          <div className="bg-surface/95 backdrop-blur-sm rounded-xl p-6 border border-border">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🎨 Welcome to Arena for Creatives!
            </h2>
            
            <p className="text-base text-text-secondary mb-4">
              We're excited to have you here for our <span className="text-primary font-semibold">soft launch</span>!
            </p>

            {/* Launch Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary mb-1 text-sm">Soft Launch Date</h3>
                  <p className="text-sm text-text-secondary">
                    <span className="font-bold text-primary">November 30, 2024</span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Join us as we test and refine the platform together!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <TestTube className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Testing Phase</h3>
                  <p className="text-sm text-text-secondary">
                    We're actively testing all features and functionality. Your feedback is invaluable in helping us improve!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Users className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm">What to Expect</h3>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Submit your creative work to contests</li>
                    <li>• Vote and engage with the community</li>
                    <li>• Earn XP and level up your profile</li>
                    <li>• Help us identify bugs and improvements</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-warning font-medium">
                ⚠️ <strong>Please Note:</strong> During this testing phase, you may encounter bugs or incomplete features. 
                We appreciate your patience and feedback!
              </p>
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-3 p-2 bg-background rounded-lg cursor-pointer hover:bg-background/80 transition-colors mb-3">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer"
              />
              <span className="text-xs text-text-secondary">
                Don't show this message for 24 hours
              </span>
            </label>

            {/* CTA Button */}
            <button
              onClick={handleClose}
              className="w-full px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Let's Get Started! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
