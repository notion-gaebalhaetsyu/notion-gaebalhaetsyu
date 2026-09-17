"use client";

import { useState } from 'react';
import { WidgetComment, UserRole } from '@/utils/firebase/types';
import { auth } from '@/utils/firebase/client';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface CurrentUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
}

interface WidgetCommentsProps {
  widgetId: string;
  creatorProfileId?: string;
  creatorEmail?: string;
  initialComments?: WidgetComment[];
  currentUser?: CurrentUser | null;
}

export default function WidgetComments({
  widgetId,
  creatorProfileId,
  creatorEmail,
  initialComments = [],
  currentUser,
}: WidgetCommentsProps) {
  const [comments, setComments] = useState<WidgetComment[]>(initialComments);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error('세션 생성에 실패했습니다.');
      }

      // 현재 페이지를 새로고침하여 로그인된 상태로 즉시 전환
      window.location.reload();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-closed-by-user') return;
      alert('로그인 중 문제가 발생했습니다: ' + (error.message || '다시 시도해주세요.'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmed = content.trim();
    if (!trimmed) {
      alert('댓글 내용을 입력해주세요!');
      return;
    }

    if (trimmed.length > 500) {
      alert('댓글은 500자 이내로 작성해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/widgets/${widgetId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '댓글 등록에 실패했습니다.');
      }

      // 최신 댓글을 상단에 즉시 추가
      setComments((prev) => [data.comment, ...prev]);
      setContent('');
      showFeedback('소중한 한마디가 등록되었슈! 🍕', 'success');
    } catch (err: any) {
      console.error('Comment submit error:', err);
      showFeedback(err.message || '댓글 등록에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      setDeletingId(commentId);
      const res = await fetch(`/api/widgets/${widgetId}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '댓글 삭제에 실패했습니다.');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showFeedback('댓글이 삭제되었습니다.', 'success');
    } catch (err: any) {
      console.error('Comment delete error:', err);
      showFeedback(err.message || '댓글 삭제에 실패했습니다.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (comment: WidgetComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      alert('수정할 댓글 내용을 입력해주세요.');
      return;
    }
    if (trimmed.length > 500) {
      alert('댓글은 500자 이내로 작성해주세요.');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/widgets/${widgetId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, content: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '댓글 수정에 실패했습니다.');
      }

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? data.comment : c))
      );
      setEditingId(null);
      setEditContent('');
      showFeedback('댓글이 수정되었습니다! 🍕', 'success');
    } catch (err: any) {
      console.error('Comment update error:', err);
      showFeedback(err.message || '댓글 수정에 실패했습니다.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="bg-white rounded-[24px] border border-toast-brown/30 p-6 sm:p-8 shadow-sm">
      {/* 1. 헤더 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-toast-brown/20 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2.5">
            <span>💬</span>
            <span>위젯 제작자에게 하고 싶은 말</span>
            <span className="text-sm font-bold bg-forest-green/10 text-forest-green px-2.5 py-0.5 rounded-full">
              {comments.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-ink/60 mt-1 font-medium">
            위젯에 대한 소중한 피드백이나 따뜻한 응원의 한마디를 남겨보세요.
          </p>
        </div>
      </div>

      {/* 피드백 알림 메시지 */}
      {feedbackMsg && (
        <div
          className={`mb-4 p-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-forest-green/10 text-forest-green border border-forest-green/20'
              : 'bg-strawberry-pink/10 text-strawberry-pink border border-strawberry-pink/20'
          }`}
        >
          <span>{feedbackMsg.type === 'success' ? '🍕' : '⚠️'}</span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 2. 댓글 작성 폼 */}
      <div className="mb-8">
        {currentUser ? (
          // 로그인한 사용자용 작성 폼
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-ink">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name || '내 프로필'}
                  className="w-7 h-7 rounded-full object-cover border border-toast-brown/20"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-custard-cream flex items-center justify-center text-sm">
                  🧑‍🍳
                </span>
              )}
              <span>{currentUser.name || currentUser.email.split('@')[0]}</span>
              <span className="text-xs font-normal text-ink/40">({currentUser.email})</span>
            </div>

            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="제작자에게 전하고 싶은 따뜻한 한마디나 개선 의견을 작성해주세요."
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
                className="w-full p-4 rounded-2xl border border-toast-brown/30 bg-bakery-beige/30 focus:bg-white focus:border-forest-green focus:ring-2 focus:ring-forest-green/20 outline-none text-sm text-ink resize-none transition-all placeholder:text-ink/40"
              />
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-xs text-ink/40">
                  {content.length} / 500자
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-5 py-2 rounded-xl bg-forest-green text-white text-sm font-bold hover:bg-forest-green/90 transition-all shadow-[0_2px_0_#1c452b] active:shadow-none active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin text-xs">⏳</span>
                      <span>등록 중...</span>
                    </>
                  ) : (
                    <>
                      <span>등록하기</span>
                      <span>🍕</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          // 비로그인 사용자용 가이드 박스
          <div className="rounded-2xl border border-dashed border-toast-brown/40 bg-bakery-beige/40 p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-2xl opacity-60">🔒</span>
            <p className="text-sm sm:text-base font-bold text-gray-600">
              구글 로그인 후 댓글을 작성할 수 있습니다
            </p>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="mt-1 px-5 py-2.5 rounded-xl bg-white border border-forest-green text-forest-green font-bold text-xs sm:text-sm hover:bg-forest-green hover:text-white transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span className="font-black text-sm">G</span>
              <span>{isLoggingIn ? '로그인 처리 중...' : '구글로 시작하기'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. 댓글 목록 영역 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="py-12 text-center text-ink/50 bg-bakery-beige/20 rounded-2xl border border-toast-brown/15">
            <span className="text-3xl block mb-2">🍕</span>
            <p className="text-sm font-medium">
              아직 작성된 한마디가 없슈. 첫 번째 피드백을 남겨보세요!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isCreator = Boolean(
              (creatorProfileId && comment.user_id === creatorProfileId) ||
              (creatorEmail && comment.email.toLowerCase() === creatorEmail.toLowerCase())
            );
            const canModify = Boolean(
              currentUser && (currentUser.id === comment.user_id || currentUser.role === 'admin')
            );
            const isEditing = editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="p-4 sm:p-5 rounded-2xl bg-bakery-beige/25 border border-toast-brown/20 hover:border-toast-brown/40 transition-colors"
              >
                {/* 상단 작성자 정보 및 작성 시간 */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {comment.user_avatar ? (
                      <img
                        src={comment.user_avatar}
                        alt={comment.nickname}
                        className="w-8 h-8 rounded-full object-cover border border-toast-brown/20"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-custard-cream flex items-center justify-center text-sm">
                        🧑‍🍳
                      </span>
                    )}
                    <span className="text-sm font-bold text-ink">
                      {comment.nickname}
                    </span>
                    {/* 제작자 뱃지 */}
                    {isCreator && (
                      <span className="inline-flex items-center gap-1 bg-forest-green text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                        <span>🧑‍🍳</span>
                        <span>제작자</span>
                      </span>
                    )}
                    {/* 작성자 구글 이메일 (구분용) */}
                    <span className="text-xs text-ink/40 font-mono">
                      {comment.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* 초 단위까지 표기된 작성 일시 및 수정 여부 */}
                    <div className="flex items-center gap-1.5 text-xs text-ink/45 whitespace-nowrap font-mono">
                      <span>{comment.created_at}</span>
                      {comment.updated_at && (
                        <span
                          className="text-[11px] text-forest-green font-medium font-sans cursor-help"
                          title={`최근 수정: ${comment.updated_at}`}
                        >
                          (수정됨)
                        </span>
                      )}
                    </div>

                    {/* 수정 및 삭제 버튼 */}
                    {canModify && !isEditing && (
                      <div className="flex items-center gap-1 border-l border-toast-brown/20 pl-2">
                        <button
                          onClick={() => handleStartEdit(comment)}
                          disabled={isUpdating || deletingId === comment.id}
                          className="text-xs text-ink/50 hover:text-forest-green transition-colors px-1.5 py-0.5 rounded hover:bg-forest-green/10 disabled:opacity-40 font-medium"
                          title="댓글 수정"
                        >
                          수정
                        </button>
                        <span className="text-ink/20 text-xs">·</span>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id || isUpdating}
                          className="text-xs text-ink/50 hover:text-strawberry-pink transition-colors px-1.5 py-0.5 rounded hover:bg-strawberry-pink/10 disabled:opacity-40 font-medium"
                          title="댓글 삭제"
                        >
                          {deletingId === comment.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 댓글 본문 또는 인라인 수정 폼 */}
                {isEditing ? (
                  <div className="pl-0.5 sm:pl-10 mt-2 space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      maxLength={500}
                      disabled={isUpdating}
                      className="w-full p-3.5 rounded-xl border border-forest-green/40 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/20 text-sm text-ink resize-none shadow-inner"
                      placeholder="댓글을 수정해주세요."
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink/40 font-medium">
                        {editContent.length} / 500자
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-lg border border-toast-brown/30 text-ink/70 text-xs font-bold hover:bg-toast-brown/10 transition-colors disabled:opacity-50"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={isUpdating || !editContent.trim()}
                          className="px-4 py-1.5 rounded-lg bg-forest-green text-white text-xs font-bold hover:bg-forest-green/90 transition-all shadow-sm disabled:opacity-50 flex items-center gap-1"
                        >
                          {isUpdating ? '저장 중...' : '수정 완료'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-ink/85 whitespace-pre-line leading-relaxed break-words pl-0.5 sm:pl-10">
                    {comment.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
