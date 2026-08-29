'use client'

import { useState, useRef } from 'react'

interface ThumbnailUploadInputProps {
  initialUrl?: string;
  name?: string;
}

export default function ThumbnailUploadInput({ 
  initialUrl = '', 
  name = 'thumbnail_url' 
}: ThumbnailUploadInputProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState(initialUrl)
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (최대 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일 크기는 최대 5MB까지 가능합니다.')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailUrl(reader.result as string)
      setIsUploading(false)
    }
    reader.onerror = () => {
      alert('이미지를 읽는 중 오류가 발생했습니다.')
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setThumbnailUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-ink">
          🖼️ 위젯 썸네일 이미지 <span className="text-ink/40 text-xs font-normal">(선택)</span>
        </label>
        <div className="flex items-center gap-1 bg-bakery-beige border border-toast-brown/20 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`px-2.5 py-1 rounded-md transition-colors ${inputMode === 'file' ? 'bg-forest-green text-white font-bold shadow-xs' : 'text-ink/60 hover:text-ink'}`}
          >
            파일 업로드
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors ${inputMode === 'url' ? 'bg-forest-green text-white font-bold shadow-xs' : 'text-ink/60 hover:text-ink'}`}
          >
            URL 링크
          </button>
        </div>
      </div>

      {/* 숨겨진 폼 데이터 input */}
      <input type="hidden" name={name} value={thumbnailUrl} />

      {/* 1. 미리보기가 있는 경우 */}
      {thumbnailUrl ? (
        <div className="relative rounded-2xl border-2 border-toast-brown/30 bg-bakery-beige/50 p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center border border-toast-brown/20 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={thumbnailUrl} 
              alt="위젯 썸네일 미리보기" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <p className="text-sm font-bold text-ink flex items-center justify-center sm:justify-start gap-1.5">
              <span className="text-forest-green">✓</span> 썸네일 이미지가 적용되었습니다
            </p>
            <p className="text-xs text-ink/60">
              진열대 목록 카드 및 상세 페이지 상단 배너로 표시됩니다.
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
              <button
                type="button"
                onClick={() => {
                  if (inputMode === 'file') {
                    fileInputRef.current?.click()
                  } else {
                    setThumbnailUrl('')
                  }
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-toast-brown/30 hover:bg-bakery-beige text-ink transition-colors"
              >
                🔄 이미지 변경
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-strawberry-pink/10 hover:bg-strawberry-pink/20 text-strawberry-pink transition-colors"
              >
                🗑️ 썸네일 삭제
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. 이미지가 없을 때 등록 영역 */
        <div>
          {inputMode === 'file' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-toast-brown/40 hover:border-forest-green rounded-2xl p-6 text-center cursor-pointer bg-bakery-beige/30 hover:bg-forest-green/5 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📸</div>
              <p className="text-sm font-bold text-ink group-hover:text-forest-green transition-colors">
                {isUploading ? '이미지 처리 중...' : '클릭하여 썸네일 이미지 파일 선택'}
              </p>
              <p className="text-xs text-ink/50 mt-1">
                PNG, JPG, GIF, WebP (권장 비율 16:9 또는 4:3, 최대 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <input 
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium text-sm"
              />
              <p className="text-xs text-ink/50">인터넷에 공개된 이미지 주소를 붙여넣어 주세요.</p>
            </div>
          )}
        </div>
      )}

      {/* 숨겨진 파일 인풋 */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/gif, image/webp" 
        className="hidden" 
      />
    </div>
  )
}
