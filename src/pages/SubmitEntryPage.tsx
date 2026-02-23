// @ts-nocheck - Supabase type inference issues
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { contestsApi, entriesApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Upload, Check, Save, Eye } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { awardXP } from '@/lib/xp'
import EntryPreviewModal from '@/components/entry/EntryPreviewModal'
import ProgressStepper from '@/components/entry/ProgressStepper'
import type { ContestCategory } from '@/types/contest'
import { getPhasesForCategory } from '@/constants/phases'

type PhaseFile = {
  file: File | null
  preview: string | null
  uploaded: boolean
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
  
  const [phases, setPhases] = useState<PhaseFile[]>([])
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
      const data = response.contest

      if (!data) throw new Error('Contest not found')
      setContest(data)
      
      // Initialize phases based on contest category
      const category = (data.category || 'art') as ContestCategory
      console.log('Contest category:', category, 'from data:', data.category)
      const configs = getPhasesForCategory(category)
      console.log('Phase configs for', category, ':', configs.length, 'phases')
      setPhaseConfigs(configs)
      
      // Initialize phase files array
      const initialPhases = configs.map(() => ({
        file: null,
        preview: null,
        uploaded: false
      }))
      setPhases(initialPhases)
    } catch (error) {
      console.error('Error fetching contest:', error)
    }
  }

  const fetchExistingEntry = async () => {
    if (!id || !user?.id) return
    try {
      const response: any = await entriesApi.getByContestAndUser(id, user.id)
      const data = response.entry

      if (error) {
        // Entry doesn't exist yet, that's fine
        console.log('No existing entry found')
        return
      }

      if (data) {
        const entryData = data as any
        console.log('Found existing entry:', entryData)
        setExistingEntry(entryData)
        
        // Load title and description
        if (entryData.title) setTitle(entryData.title)
        if (entryData.description) setDescription(entryData.description)
        
        // Load existing phase images
        const newPhases = [...phases]
        if (entryData.phase_1_url) {
          console.log('Loading phase 1:', entryData.phase_1_url)
          newPhases[0] = { file: null, preview: entryData.phase_1_url, uploaded: true }
        }
        if (entryData.phase_2_url) {
          console.log('Loading phase 2:', entryData.phase_2_url)
          newPhases[1] = { file: null, preview: entryData.phase_2_url, uploaded: true }
        }
        if (entryData.phase_3_url) {
          console.log('Loading phase 3:', entryData.phase_3_url)
          newPhases[2] = { file: null, preview: entryData.phase_3_url, uploaded: true }
        }
        if (entryData.phase_4_url) {
          console.log('Loading phase 4:', entryData.phase_4_url)
          newPhases[3] = { file: null, preview: entryData.phase_4_url, uploaded: true }
        }
        setPhases(newPhases)
        console.log('Phases set:', newPhases)
      }
    } catch (err) {
      console.error('Error fetching existing entry:', err)
    }
  }

  const handleFileChange = (phaseIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB')
        return
      }

      setCurrentPhaseIndex(phaseIndex)
      const newPhases = [...phases]
      newPhases[phaseIndex] = {
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
      }
      setPhases(newPhases)
      setError('')
    }
  }

  const uploadPhase = async (phaseIndex: number): Promise<string | null> => {
    const phase = phases[phaseIndex]
    if (!phase.file || !user) return null

    const fileExt = phase.file.name.split('.').pop()
    const fileName = `${user.id}/${id}/phase-${phaseIndex + 1}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('entry-artworks')
      .upload(fileName, phase.file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('entry-artworks')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSaveDraft = async () => {
    if (!user || !id) return

    setLoading(true)
    setError('')

    try {
      // Upload any new phase files
      const phaseUrls = await Promise.all(
        phases.map(async (phase, index) => {
          if (phase.file) {
            return await uploadPhase(index)
          }
          return phase.uploaded ? phase.preview : null
        })
      )

      const draftData = {
        contest_id: id,
        user_id: user.id,
        title: title || null,
        description: description || null,
        phase_1_url: phaseUrls[0],
        phase_2_url: phaseUrls[1],
        phase_3_url: phaseUrls[2],
        phase_4_url: phaseUrls[3],
        status: 'draft',
      }

      if (existingEntry) {
        await supabase
          .from('entries')
          .update(draftData as any)
          .eq('id', existingEntry.id)
      } else {
        await supabase
          .from('entries')
          .insert(draftData as any)
      }

      toast.success('Draft saved successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    // Check if at least one phase is uploaded
    const hasAnyPhase = phases.some(p => p.file || p.uploaded)
    if (!hasAnyPhase) {
      setError('Please upload at least one phase to preview')
      return
    }
    setShowPreview(true)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user || !id) return

    // Check if title is provided
    if (!title.trim()) {
      setError('Please provide a title for your entry')
      return
    }

    // Check if at least phase 1 is uploaded
    if (!phases[0].file && !phases[0].uploaded) {
      setError('Please upload at least Phase 1 (Sketch)')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload new phase files
      const phaseUrls = await Promise.all(
        phases.map(async (phase, index) => {
          if (phase.file) {
            return await uploadPhase(index)
          }
          return phase.uploaded ? phase.preview : null
        })
      )

      const entryData = {
        contest_id: id,
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        phase_1_url: phaseUrls[0],
        phase_2_url: phaseUrls[1],
        phase_3_url: phaseUrls[2],
        phase_4_url: phaseUrls[3],
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
      }

      let entryId = existingEntry?.id

      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('entries')
          .update(entryData as any)
          .eq('id', existingEntry.id)

        if (updateError) throw updateError
      } else {
        // Create new entry
        const { data: newEntry, error: insertError } = await supabase
          .from('entries')
          .insert(entryData as any)
          .select()
          .single()

        if (insertError) throw insertError
        entryId = newEntry?.id

        // Award XP for submitting entry (only for new entries)
        if (user.id && entryId) {
          await awardXP(user.id, 'submit_entry', entryId, 'Submitted contest entry')
        }
      }

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

  const phaseLabels = phaseConfigs.map((config, i) => `Phase ${i + 1}: ${config.name}`)
  const completedPhases = phases.map(p => p.file !== null || p.uploaded)
  const previewPhases = phases.map(p => ({
    file: p.file,
    url: p.preview || ''
  }))

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Submit Your Entry</h1>
      <p className="text-text-secondary mb-2">Contest: {contest.title}</p>
      <p className="text-text-secondary text-sm mb-8">
        Upload your entry in {phaseConfigs.length} phases: {phaseConfigs.map(c => c.name).join(' → ')}
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
          You already have an entry for this contest. Uploading new phases will update your existing entry.
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

          {/* Phase Uploads */}
          {phases.map((phase, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                {phaseLabels[i]}
                {phase.uploaded && <Check className="w-4 h-4 text-success" />}
                {phaseConfigs[i]?.required && <span className="text-error">*</span>}
              </label>
              {phaseConfigs[i]?.description && (
                <p className="text-xs text-text-secondary mb-2">{phaseConfigs[i].description}</p>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(i, e)}
                className="hidden"
                id={`phase-${i}`}
              />
              <label
                htmlFor={`phase-${i}`}
                className="block border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              >
                {phase.preview ? (
                  <div className="space-y-2">
                    <img src={phase.preview} alt={`Phase ${i + 1}`} className="max-h-48 mx-auto rounded" />
                    <p className="text-sm text-text-secondary">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                    <p className="text-text-secondary">Click to upload or drag and drop</p>
                    <p className="text-xs text-text-secondary mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </>
                )}
              </label>
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
