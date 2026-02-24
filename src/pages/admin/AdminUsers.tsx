import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { useToastStore } from '@/stores/toastStore'
import { formatDate } from '@/lib/utils'

type User = {
  id: string
  username: string
  email: string
  level: number
  pointsBalance: number
  createdAt: string
  role: string
  avatarUrl: string | null
  banned: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToastStore()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response: any = await adminApi.getUsers()
      const data = response.users || []
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole)
      
      // Refresh users list
      fetchUsers()
      toast.success(`User role updated to ${newRole}`)
    } catch (error: any) {
      toast.error('Failed to update role: ' + error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-secondary">No users found</p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Level</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Points</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Joined</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold">@{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-transparent border-2 cursor-pointer ${
                        user.role === 'admin'
                          ? 'border-error text-error'
                          : 'border-text-secondary text-text-secondary'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-semibold">
                      Level {user.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{user.pointsBalance} pts</td>
                  <td className="px-6 py-4 text-text-secondary">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <a
                      href={`/profile/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      View Profile
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
