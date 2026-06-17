export default function CategoryButton({ category, onClick }) {
  return (
    <button
      onClick={() => onClick(category)}
      className="flex flex-col items-center justify-center gap-1 bg-white rounded-2xl shadow p-4 active:scale-95 transition-transform border border-gray-100 min-h-[90px] select-none"
    >
      <span className="text-4xl">{category.emoji}</span>
      <span className="text-sm font-medium text-gray-700 text-center leading-tight">{category.label}</span>
    </button>
  )
}
