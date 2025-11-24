import type { ContestCategory, PhaseConfig } from '@/types/contest'

// Phase configurations for each contest category
export const PHASE_CONFIGS: Record<ContestCategory, PhaseConfig[]> = {
  art: [
    { 
      number: 1, 
      name: 'Sketch', 
      description: 'Initial sketch or concept art', 
      required: true 
    },
    { 
      number: 2, 
      name: 'Line Art', 
      description: 'Clean line work without colors', 
      required: true 
    },
    { 
      number: 3, 
      name: 'Base Colors', 
      description: 'Flat colors without shading', 
      required: true 
    },
    { 
      number: 4, 
      name: 'Final', 
      description: 'Finished artwork with all details', 
      required: true 
    }
  ],
  cosplay: [
    { 
      number: 1, 
      name: 'Raw Cosplay', 
      description: 'Unedited photo of you in costume', 
      required: true 
    },
    { 
      number: 2, 
      name: 'Final Cosplay', 
      description: 'Polished photoshoot or edited photo', 
      required: true 
    }
  ],
  photography: [
    { 
      number: 1, 
      name: 'Raw Photo', 
      description: 'Unedited RAW or JPEG with EXIF data', 
      required: true 
    },
    { 
      number: 2, 
      name: 'Edited Photo', 
      description: 'Final retouched and color-graded image', 
      required: true 
    }
  ],
  music: [
    { 
      number: 1, 
      name: 'Demo', 
      description: 'Raw recording or demo version', 
      required: true 
    },
    { 
      number: 2, 
      name: 'Final Mix', 
      description: 'Mastered final track', 
      required: true 
    }
  ],
  video: [
    { 
      number: 1, 
      name: 'Raw Footage', 
      description: 'Unedited clip or behind-the-scenes', 
      required: true 
    },
    { 
      number: 2, 
      name: 'Final Edit', 
      description: 'Complete edited video', 
      required: true 
    }
  ]
}

// Category display labels with emojis
export const CATEGORY_LABELS: Record<ContestCategory, string> = {
  art: '🎨 Art',
  cosplay: '🎭 Cosplay',
  photography: '📸 Photography',
  music: '🎵 Music',
  video: '🎬 Video'
}

// Category descriptions
export const CATEGORY_DESCRIPTIONS: Record<ContestCategory, string> = {
  art: 'Digital art, illustrations, paintings, and drawings',
  cosplay: 'Costume play and character portrayal',
  photography: 'Photo contests and exhibitions',
  music: 'Original songs, compositions, and covers',
  video: 'Short films, animations, and video content'
}

// Get phase count for a category
export const getPhaseCount = (category: ContestCategory): number => {
  return PHASE_CONFIGS[category].length
}

// Get phase config for a specific category and phase number
export const getPhaseConfig = (
  category: ContestCategory, 
  phaseNumber: number
): PhaseConfig | undefined => {
  return PHASE_CONFIGS[category].find(p => p.number === phaseNumber)
}

// Get all phases for a category
export const getPhasesForCategory = (category: ContestCategory): PhaseConfig[] => {
  return PHASE_CONFIGS[category]
}

// Check if a phase is required for a category
export const isPhaseRequired = (
  category: ContestCategory, 
  phaseNumber: number
): boolean => {
  const phase = getPhaseConfig(category, phaseNumber)
  return phase?.required ?? false
}
