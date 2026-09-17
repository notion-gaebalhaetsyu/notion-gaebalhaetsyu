'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Widget, UserRole, UserCommentItem } from '@/utils/firebase/types'

interface MyWorkbenchProps {
  bakedWidgets: Widget[]
  favoriteWidgets: Widget[]
  userComments?: UserCommentItem[]
  role?: UserRole
}

export default function MyWorkbench({ 
  bakedWidgets, 
  favoriteWidgets, 
  userComments = [], 
  role = 'visitor' 
}: MyWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'comments' | 'baked'>('favorites')
  const [commentsList, setCommentsList] = useState<UserCommentItem[]>(userComments)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isUpdatingComment, setIsUpdatingComment] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const isCreatorOrAdmin = role === 'provider' || role === 'creator' || role === 'admin'

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type })
    setTimeout(() => setFeedbackMsg(null), 3000)
  }

  // 댓글 수정 시작
  const handleStartEditComment = (item: UserCommentItem) => {
    setEditingCommentId(item.comment.id)
    setEditContent(item.comment.content)
  }

  // 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  // 댓글 수정 저장
  const handleSaveEditComment = async (item: UserCommentItem) => {
    const trimmed = editContent.trim()
    if (!trimmed) {
      alert('수정할 댓글 내용을 입력해주세요.')
      return
    }
    if (trimmed.length > 500) {
      alert('댓글은 500자 이내로 작성해주세요.')
      return
    }

    try {
      setIsUpdatingComment(true)
      const res = await fetch(`/api/widgets/${item.widget.id}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: item.comment.id,
          content: trimmed,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || '댓글 수정에 실패했습니다.')
      }

      setCommentsList(prev =>
        prev.map(c =>
          c.comment.id === item.comment.id
            ? { ...c, comment: data.comment }
            : c
        )
      )
      setEditingCommentId(null)
      setEditContent('')
      showFeedback('댓글이 수정되었습니다! 🍕', 'success')
    } catch (err: any) {
      console.error('Comment update error:', err)
      showFeedback(err.message || '댓글 수정에 실패했습니다.', 'error')
    } finally {
      setIsUpdatingComment(false)
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (item: UserCommentItem) => {
    if (!confirm(`'${item.widget.name}' 위젯에 남긴 댓글을 삭제하시겠습니까?`)) return

    try {
      setDeletingCommentId(item.comment.id)
      const res = await fetch(`/api/widgets/${item.widget.id}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: item.comment.id }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || '댓글 삭제에 실패했습니다.')
      }

      setCommentsList(prev => prev.filter(c => c.comment.id !== item.comment.id))
      showFeedback('댓글이 삭제되었습니다.', 'success')
    } catch (err: any) {
      console.error('Comment delete error:', err)
      showFeedback(err.message || '댓글 삭제에 실패했습니다.', 'error')
    } finally {
      setDeletingCommentId(null)
    }
  }

  // 위젯 카드 렌더링 함수
  const renderWidgetCard = (widget: Widget, isBaked: boolean = false) => (
    <div 
      key={widget.id} 
      className="group block bg-white rounded-[24px] border border-toast-brown/20 overflow-hidden shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all relative flex flex-col justify-between"
    >
      <div>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {isBaked && isCreatorOrAdmin && (
            <Link
              href={`/creators/widgets/${widget.id}/edit`}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/90 backdrop-blur-sm text-forest-green border border-forest-green/30 hover:bg-forest-green hover:text-white transition-colors shadow-sm"
              title="위젯 정보 수정하기"
            >
              ✏️ 수정
            </Link>
          )}
          {isBaked && (
            <span className={`px-2 py-1 text-[10px] font-bold rounded-md flex items-center ${
              widget.status === 'published' ? 'bg-forest-green text-white' : 'bg-toast-brown/20 text-toast-brown'
            }`}>
              {widget.status === 'published' ? '배포됨' : '대기중'}
            </span>
          )}
        </div>
        
        <Link href={`/widgets/${widget.slug}`} className="block">
          <div className="aspect-[4/3] bg-bakery-beige flex items-center justify-center p-6 relative overflow-hidden">
            <div className="w-full h-full bg-white/50 rounded-xl border-2 border-toast-brown/10 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
              {widget.thumbnail_url ? (
                <img src={widget.thumbnail_url} alt={widget.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <img src="/pizza_icon.png" alt="피자" className="w-14 h-14 object-contain" />
              )}
            </div>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-forest-green rounded-full shadow-sm">
              {widget.categories?.name || '개발했슈 1기'}
            </div>
          </div>
          
          <div className="p-5 pb-2">
            <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-forest-green transition-colors line-clamp-1">
              {widget.name}
            </h3>
            <p className="text-sm text-ink/60 mb-2 line-clamp-2 min-h-[40px]">
              {widget.short_description}
            </p>
          </div>
        </Link>
      </div>

      <div className="px-5 pb-4 pt-2 flex items-center justify-between text-xs font-medium text-ink/50 border-t border-toast-brown/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">👀 {widget.view_count || 0}</span>
          <span className="flex items-center gap-1">📋 {widget.copy_count || 0}</span>
          <span className="flex items-center gap-1">❤️ {widget.like_count || 0}</span>
        </div>
        {isBaked && isCreatorOrAdmin && (
          <Link
            href={`/creators/widgets/${widget.id}/edit`}
            className="text-forest-green font-bold hover:underline"
          >
            수정하기 →
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <section>
      {/* 피드백 메시지 알림 */}
      {feedbackMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all shadow-sm ${
            feedbackMsg.type === 'success'
              ? 'bg-forest-green/10 text-forest-green border border-forest-green/20'
              : 'bg-strawberry-pink/10 text-strawberry-pink border border-strawberry-pink/20'
          }`}
        >
          <span>{feedbackMsg.type === 'success' ? '🍕' : '⚠️'}</span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex gap-3 sm:gap-4 mb-8 border-b border-toast-brown/20 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 text-sm sm:text-base ${
            activeTab === 'favorites' 
              ? 'bg-ink text-white shadow-md' 
              : 'bg-white text-ink/60 hover:bg-bakery-beige'
          }`}
        >
          <img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain" />
          <span>내가 찜한 피자</span>
          <span className="ml-1 opacity-70">({favoriteWidgets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 text-sm sm:text-base ${
            activeTab === 'comments' 
              ? 'bg-ink text-white shadow-md' 
              : 'bg-white text-ink/60 hover:bg-bakery-beige'
          }`}
        >
          <span>💬</span>
          <span>내가 남긴 한마디</span>
          <span className="ml-1 opacity-70">({commentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('baked')}
          className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'baked' 
              ? 'bg-ink text-white shadow-md' 
              : 'bg-white text-ink/60 hover:bg-bakery-beige'
          }`}
        >
          🧑‍🍳 내가 구운 피자 <span className="ml-1 opacity-70">({bakedWidgets.length})</span>
        </button>
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div>
        {/* 1. 내가 찜한 피자 탭 */}
        {activeTab === 'favorites' && (
          <div>
            {favoriteWidgets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-toast-brown/20 shadow-sm border-dashed">
                <img src="/pizza_icon.png" alt="피자" className="w-16 h-16 mx-auto object-contain mb-3 opacity-60" />
                <h3 className="text-xl font-bold text-ink mb-2">아직 찜한 피자가 없슈!</h3>
                <p className="text-ink/60 font-medium mb-6">마음에 드는 위젯을 찾아 하트(❤️)를 눌러보세요.</p>
                <Link href="/widgets" className="inline-block bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-colors">
                  진열대 구경가기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteWidgets.map(w => renderWidgetCard(w))}
              </div>
            )}
          </div>
        )}

        {/* 2. 내가 남긴 한마디 (댓글) 탭 */}
        {activeTab === 'comments' && (
          <div>
            {commentsList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-toast-brown/20 shadow-sm border-dashed">
                <span className="text-5xl block mb-3 opacity-70">💬</span>
                <h3 className="text-xl font-bold text-ink mb-2">아직 남긴 한마디가 없슈!</h3>
                <p className="text-ink/60 font-medium mb-6">위젯 상세 페이지에서 제작자에게 따뜻한 응원이나 피드백을 남겨보세요. 🍕</p>
                <Link href="/widgets" className="inline-block bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-colors">
                  진열대 둘러보기
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {commentsList.map(item => {
                  const isEditing = editingCommentId === item.comment.id

                  return (
                    <div
                      key={item.comment.id}
                      className="bg-white rounded-[24px] border border-toast-brown/20 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all"
                    >
                      {/* 상단: 연결된 위젯 정보 및 액션 버튼 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-toast-brown/15">
                        <Link 
                          href={`/widgets/${item.widget.slug}`} 
                          className="flex items-center gap-3 group flex-1 min-w-0"
                        >
                          <div className="w-11 h-11 rounded-xl bg-bakery-beige flex items-center justify-center overflow-hidden border border-toast-brown/20 flex-shrink-0 group-hover:border-forest-green transition-colors">
                            {item.widget.thumbnail_url ? (
                              <img 
                                src={item.widget.thumbnail_url} 
                                alt={item.widget.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span className="text-2xl">🍕</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-ink text-sm sm:text-base group-hover:text-forest-green transition-colors truncate">
                                {item.widget.name}
                              </span>
                              <span className="text-[11px] font-bold bg-forest-green/10 text-forest-green px-2 py-0.5 rounded-full whitespace-nowrap">
                                {item.widget.category_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-ink/40 font-mono">
                              <span>작성: {item.comment.created_at}</span>
                              {item.comment.updated_at && (
                                <span
                                  className="text-[11px] text-forest-green font-medium font-sans cursor-help"
                                  title={`최근 수정: ${item.comment.updated_at}`}
                                >
                                  (수정됨)
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>

                        {/* 우측 액션 버튼들 */}
                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                          <Link
                            href={`/widgets/${item.widget.slug}`}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-toast-brown/10 text-ink/70 hover:bg-toast-brown/20 hover:text-ink transition-colors flex items-center gap-1"
                            title="해당 위젯 상세 페이지로 이동"
                          >
                            <span>위젯 보기</span>
                            <span>↗</span>
                          </Link>
                          {!isEditing && (
                            <>
                              <button
                                onClick={() => handleStartEditComment(item)}
                                disabled={isUpdatingComment || deletingCommentId === item.comment.id}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-toast-brown/30 text-ink/70 hover:bg-forest-green/10 hover:border-forest-green hover:text-forest-green transition-colors disabled:opacity-40"
                              >
                                ✏️ 수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(item)}
                                disabled={deletingCommentId === item.comment.id || isUpdatingComment}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-toast-brown/30 text-ink/70 hover:bg-strawberry-pink/10 hover:border-strawberry-pink hover:text-strawberry-pink transition-colors disabled:opacity-40"
                              >
                                {deletingCommentId === item.comment.id ? '삭제 중...' : '🗑️ 삭제'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 하단: 댓글 본문 또는 인라인 수정 에디터 */}
                      {isEditing ? (
                        <div className="mt-3.5 space-y-2.5">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            maxLength={500}
                            disabled={isUpdatingComment}
                            className="w-full p-3.5 rounded-xl border border-forest-green/40 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/20 text-sm text-ink resize-none shadow-inner"
                            placeholder="댓글 내용을 수정해주세요."
                            autoFocus
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ink/40 font-medium">
                              {editContent.length} / 500자
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEditComment}
                                disabled={isUpdatingComment}
                                className="px-3 py-1.5 rounded-lg border border-toast-brown/30 text-ink/70 text-xs font-bold hover:bg-toast-brown/10 transition-colors disabled:opacity-50"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditComment(item)}
                                disabled={isUpdatingComment || !editContent.trim()}
                                className="px-4 py-1.5 rounded-lg bg-forest-green text-white text-xs font-bold hover:bg-forest-green/90 transition-all shadow-sm disabled:opacity-50 flex items-center gap-1"
                              >
                                {isUpdatingComment ? '저장 중...' : '수정 완료 🍕'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3.5 p-4 rounded-xl bg-bakery-beige/30 border border-toast-brown/15 text-sm text-ink/85 whitespace-pre-line leading-relaxed">
                          {item.comment.content}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. 내가 구운 피자 탭 */}
        {activeTab === 'baked' && (
          <div>
            {!isCreatorOrAdmin ? (
              <div className="text-center py-16 px-6 bg-white rounded-3xl border border-toast-brown/20 shadow-sm max-w-lg mx-auto">
                <div className="text-5xl mb-4">☕</div>
                <h3 className="text-xl font-bold text-ink mb-2">일반 손님 계정입니다</h3>
                <p className="text-sm text-ink/70 font-medium mb-6 leading-relaxed">
                  현재는 위젯을 자유롭게 둘러보고 노션에 다운로드(복사)할 수 있습니다.<br />
                  직접 위젯을 등록하고 관리하려면 <strong>1기 제작자 인증</strong>을 진행해 주세요.
                </p>
                <Link 
                  href="/creators/join" 
                  className="inline-flex items-center gap-2 bg-forest-green text-white font-bold py-3.5 px-8 rounded-xl hover:bg-forest-green/90 transition-colors shadow-md text-base"
                >
                  <span>🧑‍🍳</span> 1기 제작자 인증하러 가기
                </Link>
              </div>
            ) : bakedWidgets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-toast-brown/20 shadow-sm border-dashed">
                <img src="/pizza_icon.png" alt="피자" className="w-16 h-16 mx-auto object-contain mb-3 opacity-60" />
                <h3 className="text-xl font-bold text-ink mb-2">아직 구워낸 피자 위젯이 없네유.</h3>
                <p className="text-ink/60 font-medium mb-6">첫 위젯을 만들어 개발했슈 진열대에 공유해 보세요!</p>
                <Link href="/creators/widgets/new" className="inline-block bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-colors">
                  새 위젯 굽기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* 첫 번째 카드는 새 위젯 만들기 버튼 */}
                <Link 
                  href="/creators/widgets/new"
                  className="group flex flex-col items-center justify-center bg-bakery-beige/50 rounded-[24px] border-2 border-dashed border-toast-brown/30 h-full min-h-[340px] hover:border-forest-green hover:bg-forest-green/5 transition-all"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <span className="font-bold text-ink group-hover:text-forest-green">새 위젯 굽기</span>
                </Link>
                {bakedWidgets.map(w => renderWidgetCard(w, true))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
