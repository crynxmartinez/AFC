import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { contestsApi, entriesApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Link as LinkIcon, Check, Save, Eye, X } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import EntryPreviewModal from '@/components/entry/EntryPreviewModal'
import ProgressStepper from '@/components/entry/ProgressStepper'
import type { ContestCategory } from '@/types/contest'
import { getPhasesForCategory } from '@/constants/phases'

type PhaseUrl = {
  url: string
  hasValue: boolean
}

export default function SubmitEntryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [contest, setContest] = useState<any>(null)
  const [existingEntry, setExistingEntry] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  
  const [phases, setPhases] = useState<PhaseUrl[]>([])
  const [phaseConfigs, setPhaseConfigs] = useState<any[]>([])
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const toast = useToastStore()

  useEffect(() => {
    if (id && user) {
      fetchContest()
      fetchExistingEntry()
    }
  }, [id, user])

  const fetchContest = async () => {
    if (!id) return
    try {
      const response: any = await contestsApi.get(id)
      const data = response.data?.contest || response.contest || response.data

      if (!data) throw new Error('Contest not found')
      setContest(data)
      
      // Initialize phases based on contest category
      const category = (data.category || 'art') as ContestCategory
      const configs = getPhasesForCategory(category)
      setPhaseConfigs(configs)
      
      // Initialize phase URL array
      const initialPhases = configs.map(() => ({
        url: '',
        hasValue: false
      }))
      setPhases(initialPhases)
    } catch (err) {
      console.error('Error fetching contest:', err)
    }
  }

  const fetchExistingEntry = async () => {
    if (!id || !user?.id) return
    try {
      const response: any = await entriesApi.getByContestAndUser(id, user.id)
      const data = response.data?.entry || response.entry || response.data

      if (!data) return

      setExistingEntry(data)
      
      // Load title and description
      if (data.title) setTitle(data.title)
      if (data.description) setDescription(data.description)
      
      // Load existing phase URLs
      const newPhases = [...phases]
      const phaseKeys = ['phase1Url', 'phase2Url', 'phase3Url', 'phase4Url']
      const phaseKeysSnake = ['phase_1_url', 'phase_2_url', 'phase_3_url', 'phase_4_url']
      
      for (let i = 0; i < 4; i++) {
        const url = data[phaseKeys[i]] || data[phaseKeysSnake[i]] || ''
        if (url) {
          newPhases[i] = { url, hasValue: true }
        }
      }
      setPhases(newPhases)
    } catch (err) {
      console.error('Error fetching existing entry:', err)
    }
  }

  const handleUrlChange = (phaseIndex: number, url: string) => {
    setCurrentPhaseIndex(phaseIndex)
    const newPhases = [...phases]
    newPhases[phaseIndex] = {
      url,
      hasValue: url.trim().length > 0,
    }
    setPhases(newPhases)
    setError('')
  }

  const handleSaveDraft = async () => {
    if (!user || !id) return

    setLoading(true)
    setError('')

    try {
      const draftData: any = {
        contestId: id,
        title: title || null,
        description: description || null,
        phase1Url: phases[0]?.url || null,
        phase2Url: phases[1]?.url || null,
        phase3Url: phases[2]?.url || null,
        phase4Url: phases[3]?.url || null,
        status: 'draft',
      }

      if (existingEntry) {
        await entriesApi.update(existingEntry.id, draftData)
      } else {
        const response: any = await entriesApi.create(draftData)
        if (response.data?.entry) setExistingEntry(response.data.entry)
      }

      toast.success('Draft saved successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    const hasAnyPhase = phases.some(p => p.hasValue)
    if (!hasAnyPhase) {
      setError('Please provide at least one phase image URL to preview')
      return
    }
    setShowPreview(true)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user || !id) return

    if (!title.trim()) {
      setError('Please provide a title for your entry')
      return
    }

    if (!phases[0]?.url?.trim()) {
      setError('Please provide at least Phase 1 image URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      const entryData: any = {
        contestId: id,
        title: title.trim(),
        description: description.trim() || null,
        phase1Url: phases[0]?.url || null,
        phase2Url: phases[1]?.url || null,
        phase3Url: phases[2]?.url || null,
        phase4Url: phases[3]?.url || null,
        status: 'pending_review',
      }

      if (existingEntry) {
        await entriesApi.update(existingEntry.id, entryData)
      } else {
        await entriesApi.create(entryData)
      }

      toast.success(existingEntry ? 'Entry updated!' : 'Entry submitted for review!')
      navigate(`/contests/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to submit entry')
    } finally {
      setLoading(false)
    }
  }

  if (!contest) {
    return <div className="text-center py-12">Loading...</div>
  }

  // Check if contest allows submissions/edits
  const isVotingOrCompleted = contest.status === 'voting' || contest.status === 'completed' || contest.status === 'cancelled'

  const phaseLabels = phaseConfigs.map((config: any, i: number) => `Phase ${i + 1}: ${config.name}`)
  const completedPhases = phases.map(p => p.hasValue)
  const previewPhases = phases.map(p => ({
    url: p.url || ''
  }))

  // If contest is in voting/completed and user has existing entry, show read-only view
  if (isVotingOrCompleted && existingEntry) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Your Entry</h1>
        <p className="text-text-secondary mb-2">Contest: {contest.title}</p>
        <div className="bg-info/10 border border-info text-info px-4 py-3 rounded-lg mb-6">
          This contest is now in {contest.status} phase. Entries can no longer be edited.
        </div>
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{existingEntry.title || 'Untitled Entry'}</h2>
          {existingEntry.description && (
            <p className="text-text-secondary mb-6">{existingEntry.description}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[existingEntry.phase1Url, existingEntry.phase2Url, existingEntry.phase3Url, existingEntry.phase4Url]
              .filter(Boolean)
              .map((url, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Phase {i + 1}</p>
                  <img src={url} alt={`Phase ${i + 1}`} className="w-full rounded" />
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{existingEntry ? 'Edit Your Entry' : 'Submit Your Entry'}</h1>
      <p className="text-text-secondary mb-2">Contest: {contest.title}</p>
      <p className="text-text-secondary text-sm mb-8">
        Provide image URLs for your entry in {phaseConfigs.length} phases: {phaseConfigs.map((c: any) => c.name).join(' → ')}
      </p>

      {/* Progress Stepper */}
      <ProgressStepper currentPhase={currentPhaseIndex} completedPhases={completedPhases} />

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {existingEntry && (
        <div className="bg-warning/10 border border-warning text-warning px-4 py-3 rounded-lg mb-4">
          You already have an entry for this contest. Updating will modify your existing entry.
          <br />
          <span className="text-sm">Status: {existingEntry.status}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6">
        <div className="space-y-6">
          {/* Title and Description */}
          <div className="space-y-4 pb-6 border-b border-border">
            <div>
              <label className="block text-sm font-medium mb-2">
                Entry Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your artwork a title..."
                maxLength={100}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-secondary mt-1">{title.length}/100 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your creative process, inspiration, or techniques used..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
              />
              <p className="text-xs text-text-secondary mt-1">{description.length}/500 characters</p>
            </div>
          </div>

          {/* Phase URL Inputs */}
          {phases.map((phase, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                {phaseLabels[i]}
                {phase.hasValue && <Check className="w-4 h-4 text-success" />}
                {phaseConfigs[i]?.required && <span className="text-error">*</span>}
              </label>
              {phaseConfigs[i]?.description && (
                <p className="text-xs text-text-secondary mb-2">{phaseConfigs[i].description}</p>
              )}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="w-4 h-4 text-text-secondary" />
                </div>
                <input
                  type="url"
                  value={phase.url}
                  onChange={(e) => handleUrlChange(i, e.target.value)}
                  placeholder="https://example.com/your-artwork-image.png"
                  className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                />
                {phase.url && (
                  <button
                    type="button"
                    onClick={() => handleUrlChange(i, '')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {phase.url && (
                <div className="mt-3 border border-border rounded-lg p-3 bg-surface/50">
                  <img 
                    src={phase.url} 
                    alt={`Phase ${i + 1} preview`} 
                    className="max-h-48 rounded mx-auto"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex-1 py-3 bg-background hover:bg-border rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="flex-1 py-3 bg-background hover:bg-border rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : existingEntry ? 'Update Entry' : 'Submit for Review'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <EntryPreviewModal
          phases={previewPhases}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false)
            handleSubmit()
          }}
          loading={loading}
        />
      )}
    </div>
  )
}
