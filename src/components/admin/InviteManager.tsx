"use client"

import { useState } from 'react'
import { CohortInvite, UserRole } from '@/utils/firebase/types'
import { addInviteAction, bulkAddInvitesAction, deleteInviteAction } from '@/app/admin/actions'

export default function InviteManager({ initialInvites }: { initialInvites: CohortInvite[] }) {
  const [invites, setInvites] = useState<CohortInvite[]>(initialInvites)
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'used'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Single form states
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [cohort, setCohort] = useState('개발했슈 1기')
  const [role, setRole] = useState<UserRole>('provider')
  const [customCode, setCustomCode] = useState('')
  const [autoCode, setAutoCode] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Bulk form states
  const [bulkText, setBulkText] = useState('')
  const [bulkCohort, setBulkCohort] = useState('개발했슈 1기')
  const [bulkRole, setBulkRole] = useState<UserRole>('provider')
  const [bulkResult, setBulkResult] = useState<string[] | null>(null)

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const handleCopy = (code: string, id?: string) => {
    navigator.clipboard.writeText(code)
    if (id) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // 1. 단일 등록 핸들러
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMsg(null)
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('nickname', nickname)
    formData.append('email', email)
    formData.append('cohort', cohort)
    formData.append('role', role)
    if (!autoCode && customCode) {
      formData.append('code', customCode)
    }

    const res = await addInviteAction(formData)
    setIsSubmitting(false)

    if (res.error) {
      setFormMsg({ type: 'error', text: res.error })
    } else {
      setFormMsg({ type: 'success', text: res.message || '초대 코드가 생성되었습니다.' })
      setNickname('')
      setEmail('')
      setCustomCode('')
      // 새로고침 대신 상태 반영 (임시 추가)
      const newInv: CohortInvite = {
        id: 'new_' + Date.now(),
        nickname,
        email: email.toLowerCase().trim(),
        code: customCode || '발급완료(새로고침시 표시)',
        cohort,
        role,
        is_used: false,
        created_at: new Date().toISOString(),
      }
      setInvites([newInv, ...invites])
    }
  }

  // 2. 일괄 등록 핸들러
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormMsg(null)
    setBulkResult(null)

    const res = await bulkAddInvitesAction(bulkText, bulkCohort, bulkRole)
    setIsSubmitting(false)

    if (res.error) {
      setFormMsg({ type: 'error', text: res.error })
    } else {
      setFormMsg({ type: 'success', text: res.message || '일괄 등록이 완료되었습니다.' })
      setBulkResult(res.results || [])
      setBulkText('')
    }
  }

  // 3. 삭제 핸들러
  const handleDelete = async (id?: string) => {
    if (!id || !confirm('정말 이 초대 코드를 삭제하시겠습니까?')) return
    const res = await deleteInviteAction(id)
    if (res.success) {
      setInvites(invites.filter(i => i.id !== id))
    } else {
      alert(res.error || '삭제 실패')
    }
  }

  // 필터링
  const filteredInvites = invites.filter(inv => {
    if (filterStatus === 'pending' && inv.is_used) return false
    if (filterStatus === 'used' && !inv.is_used) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const matchNick = inv.nickname?.toLowerCase().includes(q)
      const matchEmail = inv.email?.toLowerCase().includes(q)
      const matchCode = inv.code?.toLowerCase().includes(q)
      return matchNick || matchEmail || matchCode
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* 상단 탭: 단일 등록 vs 일괄 등록 */}
      <div className="bg-white rounded-[28px] border border-toast-brown/20 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-toast-brown/15 pb-4 mb-6">
          <h3 className="text-xl font-extrabold text-ink flex items-center gap-2">
            <span>🎟️</span> 1기 참가자 초대 코드 발급 & 등록
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveMode('single'); setFormMsg(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeMode === 'single'
                  ? 'bg-forest-green text-white shadow-sm'
                  : 'bg-bakery-beige text-ink/70 hover:bg-toast-brown/10'
              }`}
            >
              개별 1건 등록
            </button>
            <button
              onClick={() => { setActiveMode('bulk'); setFormMsg(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeMode === 'bulk'
                  ? 'bg-forest-green text-white shadow-sm'
                  : 'bg-bakery-beige text-ink/70 hover:bg-toast-brown/10'
              }`}
            >
              여러 명 일괄 등록 (대량)
            </button>
          </div>
        </div>

        {/* 안내 메시지 토스트 */}
        {formMsg && (
          <div className={`p-4 rounded-xl text-sm font-bold mb-6 ${
            formMsg.type === 'success' ? 'bg-forest-green/10 text-forest-green border border-forest-green/30' : 'bg-warm-berry/10 text-warm-berry border border-warm-berry/30'
          }`}>
            {formMsg.text}
          </div>
        )}

        {/* 1. 개별 등록 폼 */}
        {activeMode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-ink/70 mb-1">기수 (Cohort)</label>
              <select
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                className="w-full bg-bakery-beige border border-toast-brown/30 rounded-xl px-3 py-2 text-sm font-bold text-ink focus:outline-none focus:border-forest-green"
              >
                <option value="개발했슈 1기">개발했슈 1기</option>
                <option value="개발했슈 2기">개발했슈 2기</option>
                <option value="운영진">운영진</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 mb-1">부여 권한 (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-bakery-beige border border-toast-brown/30 rounded-xl px-3 py-2 text-sm font-bold text-ink focus:outline-none focus:border-forest-green"
              >
                <option value="provider">🧑‍🍳 제작자 (provider)</option>
                <option value="admin">👑 관리자 (admin)</option>
                <option value="visitor">☕ 일반 (visitor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 mb-1">참가자 닉네임 *</label>
              <input
                type="text"
                required
                placeholder="예: 필버트"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-bakery-beige border border-toast-brown/30 rounded-xl px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:border-forest-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 mb-1">구글 로그인 이메일 *</label>
              <input
                type="email"
                required
                placeholder="예: user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bakery-beige border border-toast-brown/30 rounded-xl px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:border-forest-green"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-ink/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCode}
                  onChange={(e) => setAutoCode(e.target.checked)}
                  className="rounded text-forest-green focus:ring-forest-green"
                />
                고유 해시코드 자동 생성 (예: dev1_8f9c2a)
              </label>

              {!autoCode && (
                <input
                  type="text"
                  placeholder="직접 지정할 코드 입력"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="flex-1 bg-bakery-beige border border-toast-brown/30 rounded-xl px-3 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-forest-green"
                />
              )}
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-forest-green text-white font-bold py-2.5 rounded-xl hover:bg-forest-green/90 transition-all shadow-sm disabled:opacity-50 text-sm"
              >
                {isSubmitting ? '발급 중...' : '🍕 코드 발급 & 등록'}
              </button>
            </div>
          </form>
        ) : (
          /* 2. 대량 일괄 등록 폼 */
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink/70 mb-1">기수 선택</label>
                <select
                  value={bulkCohort}
                  onChange={(e) => setBulkCohort(e.target.value)}
                  className="w-full bg-bakery-beige border border-toast-brown/30 rounded-xl px-3 py-2 text-sm font-bold text-ink focus:outline-none focus:border-forest-green"
                >
                  <option value="개발했슈 1기">개발했슈 1기</option>
                  <option value="개발했슈 2기">개발했슈 2기</option>
                  <option value="운영진">운영진</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/70 mb-1">부여 권한</label>
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value as UserRole)}
                  className="w-full bg-bakery-beige border border-toast-brown/30 rounded-xl px-3 py-2 text-sm font-bold text-ink focus:outline-none focus:border-forest-green"
                >
                  <option value="provider">🧑‍🍳 제작자 (provider)</option>
                  <option value="admin">👑 관리자 (admin)</option>
                  <option value="visitor">☕ 일반 (visitor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 mb-1">
                명단 붙여넣기 (한 줄에 <strong>닉네임, 이메일</strong> 형식으로 입력)
              </label>
              <textarea
                rows={5}
                required
                placeholder={"홍길동, hong@gmail.com\n우주피자, pizza@naver.com\n개발자김씨, kim@gmail.com"}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full bg-bakery-beige border border-toast-brown/30 rounded-xl p-3 text-sm font-mono text-ink focus:outline-none focus:border-forest-green"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-forest-green text-white font-bold px-6 py-2.5 rounded-xl hover:bg-forest-green/90 transition-all shadow-sm disabled:opacity-50 text-sm"
            >
              {isSubmitting ? '대량 발급 중...' : '🚀 일괄 자동 발급 및 저장'}
            </button>

            {bulkResult && bulkResult.length > 0 && (
              <div className="mt-4 p-4 bg-bakery-beige rounded-xl border border-toast-brown/20">
                <div className="text-xs font-bold text-forest-green mb-2">발급된 초대 코드 목록 (복사해서 참가자에게 전달하세요):</div>
                <div className="max-h-40 overflow-y-auto font-mono text-xs text-ink/80 space-y-1">
                  {bulkResult.map((res, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-toast-brown/10">
                      <span>{res}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(res.split(': ')[1] || '')}
                        className="text-forest-green hover:underline text-[11px]"
                      >
                        코드 복사
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* 하단: 발급된 초대 코드 현황 테이블 */}
      <div className="bg-white rounded-[28px] border border-toast-brown/20 shadow-sm overflow-hidden">
        {/* 검색 및 필터 바 */}
        <div className="p-6 bg-bakery-beige/50 border-b border-toast-brown/15 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-ink text-lg">발급된 초대 코드 목록</h4>
            <span className="bg-white border border-toast-brown/20 text-ink/70 text-xs font-bold px-2.5 py-1 rounded-full">
              총 {filteredInvites.length}건
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* 상태 필터 */}
            <div className="flex bg-white rounded-xl p-1 border border-toast-brown/20 text-xs font-bold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-forest-green text-white' : 'text-ink/60'}`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === 'pending' ? 'bg-forest-green text-white' : 'text-ink/60'}`}
              >
                미사용 (대기중)
              </button>
              <button
                onClick={() => setFilterStatus('used')}
                className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === 'used' ? 'bg-forest-green text-white' : 'text-ink/60'}`}
              >
                인증 완료
              </button>
            </div>

            {/* 검색창 */}
            <input
              type="text"
              placeholder="닉네임/이메일/코드 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-toast-brown/30 rounded-xl px-3 py-1.5 text-xs font-medium text-ink focus:outline-none focus:border-forest-green w-44"
            />
          </div>
        </div>

        {/* 목록 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bakery-beige border-b border-toast-brown/20 text-ink/70 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">참가자 정보</th>
                <th className="p-4">기수 / 권한</th>
                <th className="p-4">발급된 고유 해시코드</th>
                <th className="p-4">인증 상태</th>
                <th className="p-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-toast-brown/10 text-sm">
              {filteredInvites.map((inv) => (
                <tr key={inv.id || inv.code} className="hover:bg-black/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-ink">{inv.nickname}</div>
                    <div className="text-xs text-ink/50 mt-0.5">{inv.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-ink/80">{inv.cohort}</div>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        inv.role === 'admin' ? 'bg-forest-green text-white' : 'bg-custard-cream text-ink'
                      }`}>
                        {inv.role || 'provider'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-bakery-beige px-2.5 py-1 rounded-md text-xs font-mono font-bold text-forest-green border border-toast-brown/20">
                        {inv.code}
                      </code>
                      <button
                        onClick={() => handleCopy(inv.code, inv.id)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                          copiedId === inv.id 
                            ? 'bg-forest-green text-white' 
                            : 'bg-white border border-toast-brown/20 text-ink hover:bg-bakery-beige'
                        }`}
                      >
                        {copiedId === inv.id ? '✓ 복사됨' : '📋 복사'}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    {inv.is_used ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        인증 완료 ({inv.used_at ? new Date(inv.used_at).toLocaleDateString() : '완료'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        미사용 (대기중)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-xs text-warm-berry/70 hover:text-warm-berry font-bold hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvites.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink/50 font-medium">
                    등록된 초대 코드가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
