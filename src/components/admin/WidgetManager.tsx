"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function WidgetManager({ initialWidgets }: { initialWidgets: any[] }) {
  const [widgets, setWidgets] = useState(initialWidgets)
  const supabase = createClient()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('widgets')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      // 로컬 상태 업데이트
      setWidgets(widgets.map(w => w.id === id ? { ...w, status: newStatus } : w))
    } catch (err) {
      console.error('Failed to update status', err)
      alert('상태 변경에 실패했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-forest-green/10 text-forest-green'
      case 'pending': return 'bg-strawberry-pink/10 text-strawberry-pink'
      case 'draft': return 'bg-toast-brown/10 text-toast-brown'
      case 'hidden': return 'bg-ink/10 text-ink/70'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const getStatusName = (status: string) => {
    switch(status) {
      case 'published': return '공개됨'
      case 'pending': return '심사 대기중'
      case 'draft': return '작성중'
      case 'hidden': return '숨김 처리'
      default: return status
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-toast-brown/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bakery-beige border-b border-toast-brown/20 text-ink/70 text-sm">
              <th className="p-4 font-bold">위젯명</th>
              <th className="p-4 font-bold">제작자</th>
              <th className="p-4 font-bold">카테고리</th>
              <th className="p-4 font-bold">상태</th>
              <th className="p-4 font-bold text-center">액션</th>
            </tr>
          </thead>
          <tbody>
            {widgets.map((widget) => (
              <tr key={widget.id} className="border-b border-toast-brown/10 hover:bg-black/[0.02] transition-colors">
                <td className="p-4">
                  <Link href={`/widgets/${widget.slug}`} className="font-bold text-ink hover:text-forest-green hover:underline">
                    {widget.name}
                  </Link>
                  <div className="text-xs text-ink/50 mt-1">{widget.id.slice(0, 8)}...</div>
                </td>
                <td className="p-4 text-sm font-medium text-ink/80">
                  {widget.creator_profiles?.nickname || '-'}
                </td>
                <td className="p-4 text-sm font-medium text-ink/80">
                  {widget.categories?.name || '-'}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(widget.status)}`}>
                    {getStatusName(widget.status)}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <select
                    disabled={updatingId === widget.id}
                    value={widget.status}
                    onChange={(e) => handleStatusChange(widget.id, e.target.value)}
                    className="bg-white border border-toast-brown/30 rounded-lg px-3 py-1.5 text-sm font-bold text-ink focus:outline-none focus:border-forest-green disabled:opacity-50"
                  >
                    <option value="draft">작성중</option>
                    <option value="pending">심사 대기중</option>
                    <option value="published">공개 승인</option>
                    <option value="hidden">숨김</option>
                  </select>
                </td>
              </tr>
            ))}
            {widgets.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ink/50 font-medium">
                  등록된 위젯이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
