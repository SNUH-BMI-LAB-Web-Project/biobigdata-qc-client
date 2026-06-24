export function fmtNum(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return value.toLocaleString()
}

export function fmtDate(value: string | null | undefined): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function stratumKey(row: {
  stratum1Name: string
  stratum2Name: string
  stratum3Name: string
  stratum4Name: string
  stratum5Name: string
}): string {
  const parts = [
    row.stratum1Name,
    row.stratum2Name,
    row.stratum3Name,
    row.stratum4Name,
    row.stratum5Name,
  ].filter((value) => value !== null && value !== undefined && String(value).trim() !== '')

  return parts.length ? parts.join(' / ') : '-'
}
