export default function BarChart({ data, valueKey = 'amount', labelKey = 'label', color = '#6366f1', unit = '' }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <div className="flex items-end gap-0.5 h-28 w-full">
      {data.map((d, i) => {
        const val = d[valueKey] || 0
        const pct = (val / max) * 100
        return (
          <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{ height: `${Math.max(pct, val > 0 ? 5 : 0)}%`, backgroundColor: color, opacity: val > 0 ? 1 : 0.15 }}
              title={`${d[labelKey]}: ${val}${unit}`}
            />
            {data.length <= 12 && (
              <span className="text-[8px] text-gray-400 mt-0.5 truncate w-full text-center">{d[labelKey]}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
