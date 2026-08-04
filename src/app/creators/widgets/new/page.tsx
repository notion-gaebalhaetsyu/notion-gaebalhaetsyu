import { getCategories } from './actions'
import WidgetForm from './WidgetForm'

export default async function NewWidgetPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto mt-12 pb-24">
      <div className="bg-white rounded-[24px] border border-toast-brown/30 p-8 shadow-sm relative overflow-hidden">
        {/* 장식용 텍스쳐 */}
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-ink mb-2">🍞 새 위젯 굽기</h1>
            <p className="text-ink/70 font-medium">
              직접 만든 귀여운 위젯을 진열대에 올리기 위해 정보를 입력해 주세요.
            </p>
          </div>

          <WidgetForm categories={categories} />
        </div>
      </div>
    </div>
  )
}
