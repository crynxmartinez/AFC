import { useParams } from 'react-router-dom'

export default function SubmitEntryPage() {
  const { id: _id } = useParams()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Submit Your Entry</h1>
      <p className="text-text-secondary mb-8">
        Upload your artwork in 4 phases: Sketch → Line Art → Base Colors → Final
      </p>

      <div className="bg-surface rounded-lg p-6">
        <div className="space-y-6">
          {['Phase 1: Sketch', 'Phase 2: Line Art', 'Phase 3: Base Colors', 'Phase 4: Final'].map((phase, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2">{phase}</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <p className="text-text-secondary">Click to upload or drag and drop</p>
                <p className="text-xs text-text-secondary mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors">
          Submit for Review
        </button>
      </div>
    </div>
  )
}
