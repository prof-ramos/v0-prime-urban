import Image from 'next/image'
import type { CSSProperties } from 'react'

const logoStyle: CSSProperties = {
  height: 28,
  width: 'auto',
}

export function Logo() {
  return <Image alt="PrimeUrban" height={28} src="/icon.svg" style={logoStyle} width={140} />
}
