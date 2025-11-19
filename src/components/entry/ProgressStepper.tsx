import { Check } from 'lucide-react'

type ProgressStepperProps = {
  currentPhase: number
  completedPhases: boolean[]
}

export default function ProgressStepper({ currentPhase, completedPhases }: ProgressStepperProps) {
  const phases = [
    { number: 1, label: 'Sketch' },
    { number: 2, label: 'Line Art' },
    { number: 3, label: 'Color' },
    { number: 4, label: 'Final' },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {phases.map((phase, index) => {
          const isCompleted = completedPhases[index]
          const isCurrent = currentPhase === index
          const isLast = index === phases.length - 1

          return (
            <div key={phase.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    isCompleted
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-primary text-white ring-4 ring-primary/30'
                      : 'bg-background text-text-secondary border-2 border-border'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : phase.number}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-text-secondary'
                  }`}
                >
                  {phase.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-1 mx-2 mt-[-24px]">
                  <div
                    className={`h-full rounded transition-all ${
                      completedPhases[index + 1] || (isCompleted && currentPhase > index)
                        ? 'bg-success'
                        : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
