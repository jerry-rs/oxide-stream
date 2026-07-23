import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSize(bytes: number | null | undefined): string {
  if (bytes == null) return '-'
  const units = ['B', 'K', 'M', 'G', 'T']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function convertSrtToVtt(srt: string): string {
  let vtt = 'WEBVTT\n\n'
  vtt += srt
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
    .replace(/\r\n/g, '\n')
  return vtt
}


export function formatTimestamp(ts: number | null | undefined): string {
  if (ts == null) return '-'
  try {
    const date = new Date(ts * 1000)
    if (isNaN(date.getTime())) return '-'

    const pad = (n: number) => n.toString().padStart(2, '0')

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch {
    return '-'
  }
}
