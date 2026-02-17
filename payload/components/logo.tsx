export function Logo() {
  return (
    <div
      aria-label="PrimeUrban"
      style={{
        alignItems: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          color: '#F9F6F0',
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        PrimeUrban
      </span>
      <span
        style={{
          color: '#B68863',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        Brasília
      </span>
    </div>
  )
}
