"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function UserManager({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const supabase = createClient()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id)

      if (error) throw error

      // 로컬 상태 업데이트
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
    } catch (err) {
      console.error('Failed to update role', err)
      alert('권한 변경에 실패했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <span className="bg-forest-green text-white px-3 py-1 rounded-full text-xs font-bold">관리자 (Admin)</span>
      case 'creator': return <span className="bg-custard-cream text-ink px-3 py-1 rounded-full text-xs font-bold">제작자 (Creator)</span>
      default: return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">주민 (General)</span>
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-toast-brown/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bakery-beige border-b border-toast-brown/20 text-ink/70 text-sm">
              <th className="p-4 font-bold">이메일</th>
              <th className="p-4 font-bold">가입일</th>
              <th className="p-4 font-bold">현재 권한</th>
              <th className="p-4 font-bold text-center">권한 변경</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-toast-brown/10 hover:bg-black/[0.02] transition-colors">
                <td className="p-4">
                  <div className="font-bold text-ink">{user.email || '-'}</div>
                  <div className="text-xs text-ink/50 mt-1">{user.id}</div>
                </td>
                <td className="p-4 text-sm font-medium text-ink/80">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="p-4 text-center">
                  <select
                    disabled={updatingId === user.id}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-white border border-toast-brown/30 rounded-lg px-3 py-1.5 text-sm font-bold text-ink focus:outline-none focus:border-forest-green disabled:opacity-50"
                  >
                    <option value="general">주민 (일반)</option>
                    <option value="creator">제빵사 (크리에이터)</option>
                    <option value="admin">촌장 (관리자)</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-ink/50 font-medium">
                  가입한 유저가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
