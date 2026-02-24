import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

type Phase = {
  url: string
}

type EntryPreviewModalProps = {
  phases: Phase[]
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function EntryPreviewModal({ phases, onClose, onConfirm, loading }: EntryPreviewModalProps) {
  const [currentPhase, setCurrentPhase] = useState(0)

  const hasAllPhases = phases.every(p => p.url)
  const validPhases = phases.filter(p => p.url)

  const nextPhase = () => {
    if (currentPhase < validPhases.length - 1) {
      setCurrentPhase(currentPhase + 1)
    }
  }

  const prevPhase = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Preview Your Entry</h2>
            <p className="text-text-secondary text-sm mt-1">
              Review all phases before submitting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Phase Indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-center gap-2">
            {validPhases.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhase(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPhase === index
                    ? 'bg-primary text-white'
                    : 'bg-background hover:bg-border'
                }`}
              >
                Phase {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Image Preview */}
        <div className="flex-1 overflow-auto p-6">
          <div className="relative aspect-video bg-background rounded-lg overflow-hidden">
            {validPhases[currentPhase] && (
              <img
                src={validPhases[currentPhase].url}
                alt={`Phase ${currentPhase + 1}`}
                className="w-full h-full object-contain"
              />
            )}

            {/* Navigation Arrows */}
            {currentPhase > 0 && (
              <button
                onClick={prevPhase}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-surface/90 hover:bg-surface rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {currentPhase < validPhases.length - 1 && (
              <button
                onClick={nextPhase}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-surface/90 hover:bg-surface rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Phase Info */}
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold mb-2">Phase {currentPhase + 1}</h3>
            <p className="text-text-secondary">
              {currentPhase === 0 && 'Sketch - Initial concept and ideas'}
              {currentPhase === 1 && 'Line Art - Clean outlines and structure'}
              {currentPhase === 2 && 'Color - Adding colors and shading'}
              {currentPhase === 3 && 'Final - Polished and complete artwork'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          {!hasAllPhases && (
            <div className="mb-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <p className="text-warning text-sm">
                ⚠️ Not all phases have been provided. You can submit anyway, but it's recommended to complete all phases.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-background hover:bg-border rounded-lg font-medium transition-colors"
            >
              Back to Edit
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Submitting...' : 'Confirm & Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
