// @ts-nocheck - Supabase type inference issues
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Upload, Check } from 'lucide-react'
import { awardXP } from '@/lib/xp'

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
  
  const [phases, setPhases] = useState<PhaseFile[]>([
    { file: null, preview: null, uploaded: false },
    { file: null, preview: null, uploaded: false },
    { file: null, preview: null, uploaded: false },
    { file: null, preview: null, uploaded: false },
  ])

  useEffect(() => {
    if (id && user) {
      fetchContest()
      fetchExistingEntry()
    }
  }, [id, user])

  const fetchContest = async () => {
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setContest(data)
    } catch (error) {
      console.error('Error fetching contest:', error)
    }
  }

  const fetchExistingEntry = async () => {
    if (!id || !user?.id) return
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('contest_id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        // Entry doesn't exist yet, that's fine
        console.log('No existing entry found')
        return
      }

      if (data) {
        const entryData = data as any
        console.log('Found existing entry:', entryData)
        setExistingEntry(entryData)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

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

  const phaseLabels = ['Phase 1: Sketch', 'Phase 2: Line Art', 'Phase 3: Base Colors', 'Phase 4: Final']

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Submit Your Entry</h1>
      <p className="text-text-secondary mb-2">Contest: {contest.title}</p>
      <p className="text-text-secondary text-sm mb-8">
        Upload your artwork in 4 phases: Sketch → Line Art → Base Colors → Final
      </p>

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
          {phases.map((phase, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                {phaseLabels[i]}
                {phase.uploaded && <Check className="w-4 h-4 text-success" />}
                {i === 0 && <span className="text-error">*</span>}
              </label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : existingEntry ? 'Update Entry' : 'Submit for Review'}
        </button>
      </form>
    </div>
  )
}
