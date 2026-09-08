const tooltipStyle = {
  background: 'var(--ink)',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 13px',
  fontSize: 12.5,
  boxShadow: 'var(--shadow-md)',
}

const labelStyle = { color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: 600 }

export default function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}) {
  if (!active || !payload?.length) return null
  const formattedLabel = labelFormatter ? labelFormatter(label) : label
  return (
    <div style={tooltipStyle}>
      {formattedLabel && <div style={labelStyle}>{formattedLabel}</div>}
      {payload.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 3,
              background: entry.color || entry.payload?.fill || entry.payload?.color,
              display: 'inline-block',
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {valueFormatter
              ? valueFormatter(entry.value, entry)
              : Number(entry.value).toLocaleString()}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 'auto', paddingLeft: 8 }}>
            {entry.name}
          </span>
        </div>
      ))}
    </div>
  )
}
