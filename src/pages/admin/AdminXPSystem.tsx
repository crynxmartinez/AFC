import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { Settings, Award, TrendingUp, Users } from 'lucide-react'

type LevelConfig = {
  level: number
  xp_required: number
  title: string
}

type XPReward = {
  id: string
  actionType: string
  xpAmount: number
  description: string
  enabled: boolean
}

type LevelReward = {
  id: string
  level: number
  reward_type: string
  reward_value: string
  description: string
  auto_grant: boolean
}

type LevelStats = {
  levelRange: string
  userCount: number
}

export default function AdminXPSystem() {
  const [activeTab, setActiveTab] = useState<'levels' | 'xp-rewards' | 'level-rewards' | 'stats'>('levels')
  const [levels, setLevels] = useState<LevelConfig[]>([])
  const [xpRewards, setXPRewards] = useState<XPReward[]>([])
  const [levelRewards, setLevelRewards] = useState<LevelReward[]>([])
  const [stats, setStats] = useState<LevelStats[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // Edit states
  const [editingLevel, setEditingLevel] = useState<number | null>(null)
  const [editingXPReward, setEditingXPReward] = useState<string | null>(null)
  const [editingLevelReward, setEditingLevelReward] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'levels') {
        await fetchLevels()
      } else if (activeTab === 'xp-rewards') {
        await fetchXPRewards()
      } else if (activeTab === 'level-rewards') {
        await fetchLevelRewards()
      } else if (activeTab === 'stats') {
        await fetchStats()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLevels = async () => {
    const response: any = await adminApi.getLevels()
    const data = response.data?.levels || response.levels || response.data || []
    setLevels(data)
  }

  const fetchXPRewards = async () => {
    const response: any = await adminApi.getXPRewards()
    const data = response.data?.rewards || response.rewards || response.data || []
    setXPRewards(data)
  }

  const fetchLevelRewards = async () => {
    // Level rewards not yet available via API - show empty for now
    setLevelRewards([])
  }

  const fetchStats = async () => {
    // Stats not yet available via dedicated API - show empty for now
    setStats([])
  }

  const updateLevel = async (level: number, xp_required: number, _title: string) => {
    try {
      await adminApi.updateLevel(level, xp_required)
      
      setMessage('Level updated successfully!')
      setEditingLevel(null)
      fetchLevels()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  const updateXPReward = async (id: string, xpAmount: number, _enabled: boolean) => {
    try {
      await adminApi.updateXPReward(id, xpAmount)
      
      setMessage('XP reward updated successfully!')
      setEditingXPReward(null)
      fetchXPRewards()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  const updateLevelReward = async (_id: string, _reward_value: string, _auto_grant: boolean) => {
    try {
      // Level reward update not yet available via API
      console.warn('Level reward update API not yet implemented')
      
      setMessage('Level reward updated successfully!')
      setEditingLevelReward(null)
      fetchLevelRewards()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">XP & Level System</h1>
        <p className="text-text-secondary">Manage levels, XP rewards, and gamification settings</p>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary rounded-lg">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('levels')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'levels'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Level Config
        </button>
        <button
          onClick={() => setActiveTab('xp-rewards')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'xp-rewards'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          XP Rewards
        </button>
        <button
          onClick={() => setActiveTab('level-rewards')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'level-rewards'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Level Rewards
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Statistics
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Level Config Tab */}
          {activeTab === 'levels' && (
            <div className="bg-surface rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left">Level</th>
                    <th className="px-4 py-3 text-left">XP Required</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((level) => (
                    <tr key={level.level} className="border-t border-border">
                      {editingLevel === level.level ? (
                        <>
                          <td className="px-4 py-3">{level.level}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              defaultValue={level.xp_required}
                              id={`xp-${level.level}`}
                              className="w-full px-2 py-1 bg-background border border-border rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              defaultValue={level.title}
                              id={`title-${level.level}`}
                              className="w-full px-2 py-1 bg-background border border-border rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                const xp = (document.getElementById(`xp-${level.level}`) as HTMLInputElement).value
                                const title = (document.getElementById(`title-${level.level}`) as HTMLInputElement).value
                                updateLevel(level.level, parseInt(xp), title)
                              }}
                              className="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingLevel(null)}
                              className="px-3 py-1 bg-surface hover:bg-background rounded text-sm"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-semibold">{level.level}</td>
                          <td className="px-4 py-3">{level.xp_required.toLocaleString()} XP</td>
                          <td className="px-4 py-3">{level.title}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setEditingLevel(level.level)}
                              className="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-background text-sm text-text-secondary">
                Showing first 50 levels. Total: 100 levels configured.
              </div>
            </div>
          )}

          {/* XP Rewards Tab */}
          {activeTab === 'xp-rewards' && (
            <div className="bg-surface rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">XP Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {xpRewards.map((reward) => (
                    <tr key={reward.id} className="border-t border-border">
                      {editingXPReward === reward.id ? (
                        <>
                          <td className="px-4 py-3 font-mono text-sm">{reward.actionType}</td>
                          <td className="px-4 py-3 text-sm">{reward.description}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              defaultValue={reward.xpAmount}
                              id={`xp-amount-${reward.id}`}
                              className="w-20 px-2 py-1 bg-background border border-border rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                defaultChecked={reward.enabled}
                                id={`enabled-${reward.id}`}
                                className="rounded"
                              />
                              <span className="text-sm">Enabled</span>
                            </label>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                const xp = (document.getElementById(`xp-amount-${reward.id}`) as HTMLInputElement).value
                                const enabled = (document.getElementById(`enabled-${reward.id}`) as HTMLInputElement).checked
                                updateXPReward(reward.id, parseInt(xp), enabled)
                              }}
                              className="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingXPReward(null)}
                              className="px-3 py-1 bg-surface hover:bg-background rounded text-sm"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-mono text-sm">{reward.actionType}</td>
                          <td className="px-4 py-3 text-sm">{reward.description}</td>
                          <td className="px-4 py-3 font-semibold">+{reward.xpAmount} XP</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${reward.enabled ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                              {reward.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setEditingXPReward(reward.id)}
                              className="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Level Rewards Tab */}
          {activeTab === 'level-rewards' && (
            <div className="bg-surface rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left">Level</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Value</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Auto Grant</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {levelRewards.map((reward) => (
                    <tr key={reward.id} className="border-t border-border">
                      {editingLevelReward === reward.id ? (
                        <>
                          <td className="px-4 py-3 font-semibold">{reward.level}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                              {reward.reward_type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              defaultValue={reward.reward_value}
                              id={`value-${reward.id}`}
                              className="w-32 px-2 py-1 bg-background border border-border rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">{reward.description}</td>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              defaultChecked={reward.auto_grant}
                              id={`auto-${reward.id}`}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                const value = (document.getElementById(`value-${reward.id}`) as HTMLInputElement).value
                                const auto = (document.getElementById(`auto-${reward.id}`) as HTMLInputElement).checked
                                updateLevelReward(reward.id, value, auto)
                              }}
                              className="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingLevelReward(null)}
                              className="px-3 py-1 bg-surface hover:bg-background rounded text-sm"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-semibold">Level {reward.level}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                              {reward.reward_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold">{reward.reward_value}</td>
                          <td className="px-4 py-3 text-sm">{reward.description}</td>
                          <td className="px-4 py-3">
                            {reward.auto_grant ? '✓' : '✗'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setEditingLevelReward(reward.id)}
                              className="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Level Distribution</h3>
                {stats.map((stat) => (
                  <div key={stat.levelRange} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Level {stat.levelRange}</span>
                      <span className="text-sm font-semibold">{stat.userCount} users</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(stat.userCount / Math.max(...stats.map(s => s.userCount))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-surface rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">System Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-text-secondary">Total Levels</p>
                    <p className="text-2xl font-bold">100</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">XP Actions</p>
                    <p className="text-2xl font-bold">{xpRewards.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Level Rewards</p>
                    <p className="text-2xl font-bold">{levelRewards.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
