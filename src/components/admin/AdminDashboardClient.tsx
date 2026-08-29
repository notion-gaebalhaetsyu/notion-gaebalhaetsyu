"use client"

import { useState } from 'react'
import { Widget, DbUser, CohortInvite } from '@/utils/firebase/types'
import InviteManager from './InviteManager'
import UserManager from './UserManager'
import WidgetManager from './WidgetManager'

interface AdminDashboardClientProps {
  widgets: Widget[]
  users: DbUser[]
  invites: CohortInvite[]
}

export default function AdminDashboardClient({ widgets, users, invites }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'invites' | 'users' | 'widgets'>('invites')

  return (
    <div className="space-y-8">
      {/* 탭 네비게이션 */}
      <div className="flex bg-white/70 p-1.5 rounded-2xl border border-toast-brown/20 shadow-sm max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('invites')}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'invites'
              ? 'bg-forest-green text-white shadow-sm'
              : 'text-ink/60 hover:text-ink hover:bg-black/5'
          }`}
        >
          <span>🎟️</span>
          <span>초대 코드 관리</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'invites' ? 'bg-white/20 text-white' : 'bg-bakery-beige text-ink/70'}`}>
            {invites.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-forest-green text-white shadow-sm'
              : 'text-ink/60 hover:text-ink hover:bg-black/5'
          }`}
        >
          <span>👥</span>
          <span>가입 회원 관리</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-bakery-beige text-ink/70'}`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('widgets')}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'widgets'
              ? 'bg-forest-green text-white shadow-sm'
              : 'text-ink/60 hover:text-ink hover:bg-black/5'
          }`}
        >
          <span>🍕</span>
          <span>위젯 승인 관리</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'widgets' ? 'bg-white/20 text-white' : 'bg-bakery-beige text-ink/70'}`}>
            {widgets.length}
          </span>
        </button>
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div>
        {activeTab === 'invites' && (
          <section className="animate-fadeIn">
            <InviteManager initialInvites={invites} />
          </section>
        )}

        {activeTab === 'users' && (
          <section className="animate-fadeIn">
            <UserManager initialUsers={users} />
          </section>
        )}

        {activeTab === 'widgets' && (
          <section className="animate-fadeIn">
            <WidgetManager initialWidgets={widgets} />
          </section>
        )}
      </div>
    </div>
  )
}
