"use client"

import { useState } from 'react'
import { DbUser, UserRole } from '@/utils/firebase/types'
import { updateUserRoleAction } from '@/app/admin/actions'

export default function UserManager({ initialUsers }: { initialUsers: DbUser[] }) {
  const [users, setUsers] = useState<DbUser[]>(initialUsers)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'provider' | 'visitor'>('all')

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    setUpdatingId(id)
    try {
      const res = await updateUserRoleAction(id, newRole)
      if (res.success) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
      } else {
        alert(res.error || '권한 변경에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to update role', err)
      alert('권한 변경 중 오류가 발생했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <span className="bg-forest-green text-white px-3 py-1 rounded-full text-xs font-bold">관리자 (admin)</span>
      case 'provider':
      case 'creator': return <span className="bg-custard-cream text-ink px-3 py-1 rounded-full text-xs font-bold">제작자 (provider)</span>
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">일반 (visitor)</span>
    }
  }

  // 필터링
  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all') {
      if (roleFilter === 'provider' && user.role !== 'provider' && user.role !== 'creator') return false
      if (roleFilter === 'visitor' && user.role !== 'visitor' && user.role !== 'general') return false
      if (roleFilter === 'admin' && user.role !== 'admin') return false
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const matchEmail = user.email?.toLowerCase().includes(q)
      const matchName = user.name?.toLowerCase().includes(q)
      const matchId = user.id?.toLowerCase().includes(q)
      return matchEmail || matchName || matchId
    }
    return true
  })

  return (
    <div className="bg-white rounded-[28px] border border-toast-brown/20 shadow-sm overflow-hidden">
      {/* 상단 검색 및 필터 헤더 */}
      <div className="p-6 bg-bakery-beige/50 border-b border-toast-brown/15 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-extrabold text-ink text-lg">가입된 회원 목록</h4>
          <span className="bg-white border border-toast-brown/20 text-ink/70 text-xs font-bold px-2.5 py-1 rounded-full">
            총 {filteredUsers.length}명
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* 역할별 필터 */}
          <div className="flex bg-white rounded-xl p-1 border border-toast-brown/20 text-xs font-bold">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === 'all' ? 'bg-forest-green text-white' : 'text-ink/60'}`}
            >
              전체
            </button>
            <button
              onClick={() => setRoleFilter('provider')}
              className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === 'provider' ? 'bg-forest-green text-white' : 'text-ink/60'}`}
            >
              제작자
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === 'admin' ? 'bg-forest-green text-white' : 'text-ink/60'}`}
            >
              관리자
            </button>
            <button
              onClick={() => setRoleFilter('visitor')}
              className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === 'visitor' ? 'bg-forest-green text-white' : 'text-ink/60'}`}
            >
              일반
            </button>
          </div>

          {/* 검색창 */}
          <input
            type="text"
            placeholder="이름/이메일 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-toast-brown/30 rounded-xl px-3 py-1.5 text-xs font-medium text-ink focus:outline-none focus:border-forest-green w-40"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bakery-beige border-b border-toast-brown/20 text-ink/70 text-xs font-bold uppercase tracking-wider">
              <th className="p-4">사용자 정보</th>
              <th className="p-4">가입일</th>
              <th className="p-4">현재 권한</th>
              <th className="p-4 text-center">권한 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toast-brown/10 text-sm">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-black/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-toast-brown/20" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-forest-green/10 text-forest-green flex items-center justify-center font-bold text-xs">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-ink">{user.name || user.email?.split('@')[0]}</div>
                      <div className="text-xs text-ink/50">{user.email || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-medium text-ink/70">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="p-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="p-4 text-center">
                  <select
                    disabled={updatingId === user.id}
                    value={user.role === 'general' ? 'visitor' : user.role === 'creator' ? 'provider' : user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="bg-white border border-toast-brown/30 rounded-xl px-3 py-1.5 text-xs font-bold text-ink focus:outline-none focus:border-forest-green disabled:opacity-50"
                  >
                    <option value="visitor">☕ 일반 (visitor)</option>
                    <option value="provider">🧑‍🍳 제작자 (provider)</option>
                    <option value="admin">👑 관리자 (admin)</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-ink/50 font-medium">
                  일치하는 회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
