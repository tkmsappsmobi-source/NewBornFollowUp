export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        הכל
      </button>
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
            selected === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  )
}
