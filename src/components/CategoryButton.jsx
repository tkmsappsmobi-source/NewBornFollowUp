const CATEGORY_COLORS = {
  feeding: '#e8f4ff',
  pee: '#e8f4ff',
  poop: '#fff3e0',
  bath: '#e3f2fd',
  vitd: '#fff9e6',
  clothes: '#f3e5f5',
  growth: '#e8f5e9',
}

export default function CategoryButton({ category, onClick }) {
  const bgColor = CATEGORY_COLORS[category.id] || '#f5f5f5'

  return (
    <button
      onClick={() => onClick(category)}
      className="bg-white rounded-2xl shadow-sm p-4 h-20 active:scale-95 transition-transform flex items-center justify-between gap-3 select-none"
    >
      <span className="text-sm font-medium text-gray-700">{category.label}</span>
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-3xl">{category.emoji}</span>
      </div>
    </button>
  )
}
