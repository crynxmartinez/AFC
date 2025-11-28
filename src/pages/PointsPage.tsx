import { useToastStore } from '@/stores/toastStore'
import { Construction } from 'lucide-react'

export default function PointsPage() {
  const toast = useToastStore()

  const packages = [
    { name: 'Starter', price: 20, bonus: 2, total: 22 },
    { name: 'Basic', price: 50, bonus: 5, total: 55 },
    { name: 'Popular', price: 100, bonus: 15, total: 115, popular: true },
    { name: 'Pro', price: 500, bonus: 100, total: 600 },
    { name: 'Champion', price: 1000, bonus: 250, total: 1250 },
  ]

  const handlePurchase = () => {
    toast.info('Payment integration coming soon! 🚀')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Buy Points</h1>
      <p className="text-text-secondary mb-4">
        1 point = ₱1 = 1 vote • Points never expire
      </p>

      {/* Coming Soon Notice */}
      <div className="mb-8 p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3">
        <Construction className="w-6 h-6 text-warning flex-shrink-0" />
        <div>
          <p className="font-semibold text-warning">Payment Integration Coming Soon</p>
          <p className="text-sm text-text-secondary">We're integrating with SaligPay for secure payments. Stay tuned!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className={`bg-surface rounded-lg p-6 border-2 ${
              pkg.popular ? 'border-primary' : 'border-border'
            } relative`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">₱{pkg.price}</span>
            </div>
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Base Points</span>
                <span className="font-semibold">{pkg.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Bonus</span>
                <span className="font-semibold text-success">+{pkg.bonus}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">Total Points</span>
                <span className="font-bold text-primary">{pkg.total}</span>
              </div>
            </div>
            <button 
              onClick={handlePurchase}
              className="w-full py-2 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-surface rounded-lg p-6">
        <h3 className="font-semibold mb-4">First-time buyer bonus</h3>
        <p className="text-sm text-text-secondary">
          Get an extra +10 points on your first purchase! 🎉
        </p>
      </div>
    </div>
  )
}
