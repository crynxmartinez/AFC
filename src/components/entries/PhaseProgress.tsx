import type { ContestCategory } from '@/types/contest'
import { PHASE_CONFIGS } from '@/constants/phases'

interface PhaseProgressProps {
  category: ContestCategory
  currentPhase: number
  completedPhases: number[]
}

export default function PhaseProgress({ 
  category, 
  currentPhase, 
  completedPhases 
}: PhaseProgressProps) {
  const phases = PHASE_CONFIGS[category]

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {phases.map((phase, index) => (
          <div key={phase.number} className="flex-1 flex items-center gap-2">
            {/* Phase Indicator */}
            <div 
              className={`
                h-2 flex-1 rounded-full transition-all
                ${completedPhases.includes(phase.number) 
                  ? 'bg-primary' 
                  : phase.number === currentPhase
                  ? 'bg-primary/50'
                  : 'bg-surface'
                }
                ${phase.number === currentPhase ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
              `}
            />
            
            {/* Connector Line (except for last phase) */}
            {index < phases.length - 1 && (
              <div className="w-4 h-0.5 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Phase Labels */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        {phases.map(phase => (
          <span 
            key={phase.number}
            className={`
              ${completedPhases.includes(phase.number) ? 'text-primary font-medium' : ''}
              ${phase.number === currentPhase ? 'text-primary font-bold' : ''}
            `}
          >
            {phase.name}
          </span>
        ))}
      </div>
    </div>
  )
}
