import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

type FAQItem = {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is Arena for Creatives?',
    answer: 'Arena for Creatives is a competitive platform where artists submit artwork across multiple phases, compete for prizes, and grow their skills. Each contest has 4 phases where you refine and improve your artwork based on community feedback and votes.'
  },
  {
    category: 'General',
    question: 'How do I participate in a contest?',
    answer: 'Simply browse active contests, choose one that interests you, and submit your artwork. You can submit entries for all 4 phases, save drafts, and preview before final submission. Make sure to read the contest rules and theme before starting!'
  },
  {
    category: 'Contests',
    question: 'What are the 4 phases?',
    answer: 'Each contest has 4 phases that allow you to progressively develop your artwork: Phase 1 (Sketch/Concept), Phase 2 (Refinement), Phase 3 (Details), and Phase 4 (Final Polish). You can submit to any or all phases, with each building on the previous.'
  },
  {
    category: 'Contests',
    question: 'How does voting work?',
    answer: 'Community members can vote on submitted artworks during and after each phase. Votes help determine rankings and winners. Each user gets one vote per entry, and voting is open to all registered members.'
  },
  {
    category: 'Prizes',
    question: 'What can I win?',
    answer: 'Contest winners receive prize money (in platform points), XP for leveling up, badges, and achievements. Prize amounts vary by contest and are displayed on each contest page. Top 3 placements typically receive prizes.'
  },
  {
    category: 'Prizes',
    question: 'How is XP calculated?',
    answer: 'You earn XP for various activities: submitting entries, receiving votes, winning contests, and community engagement. XP helps you level up, unlock badges, and climb the leaderboard. Check your profile to see your current level and XP progress.'
  },
  {
    category: 'Technical',
    question: 'What file formats are supported?',
    answer: 'We support common image formats including JPG, PNG, and GIF. Maximum file size is 10MB per phase. Make sure your images are high quality but optimized for web viewing.'
  },
  {
    category: 'Technical',
    question: 'Can I edit my submission after submitting?',
    answer: 'Yes! You can edit pending entries before they are approved. Once approved, you cannot edit, but you can submit new phases or participate in other contests. Use the "Save Draft" feature to work on entries over time.'
  },
  {
    category: 'Community',
    question: 'How do I follow other artists?',
    answer: 'Visit any artist\'s profile and click the "Follow" button. You\'ll see their latest entries in your personalized feed and receive notifications when they post new work (if enabled in settings).'
  },
  {
    category: 'Community',
    question: 'Can I comment on artwork?',
    answer: 'Absolutely! Comments are encouraged. You can comment on any approved entry, reply to other comments, like comments, and even edit your own comments. Be respectful and constructive in your feedback!'
  }
]

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))]
  
  const filteredFAQs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="w-10 h-10 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
        </div>
        <p className="text-text-secondary text-lg">
          Everything you need to know about Arena for Creatives
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-border text-text-secondary'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredFAQs.map((faq, index) => (
          <div
            key={index}
            className="bg-surface rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-background transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                    {faq.category}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{faq.question}</h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-text-secondary transition-transform flex-shrink-0 ml-4 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-4 text-text-secondary">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions CTA */}
      <div className="mt-12 text-center bg-surface rounded-lg p-8 border border-border">
        <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
        <p className="text-text-secondary mb-4">
          Can't find the answer you're looking for? We're here to help!
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  )
}
