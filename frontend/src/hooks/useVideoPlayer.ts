import { useEffect, useState } from 'react'
import { convertSrtToVtt } from '@/lib/utils'
import { fetchSubtitle, fetchVideoInfo } from '@/api/videos'
import type { VideoInfo } from '@/types'

function loadSubtitle(path: string): Promise<string | undefined> {
  return fetchSubtitle(path)
    .then((srtText) => {
      const vttText = convertSrtToVtt(srtText)
      const blob = new Blob([vttText], { type: 'text/vtt' })
      return URL.createObjectURL(blob)
    })
    .catch(() => undefined)
}

function loadInfo(path: string): Promise<VideoInfo | null> {
  return fetchVideoInfo(path).catch(() => null)
}

export function useVideoPlayer(path: string) {
  const [subtitleUrl, setSubtitleUrl] = useState<string>()
  const [info, setInfo] = useState<VideoInfo | null>(null)

  useEffect(() => {
    setSubtitleUrl(undefined)
    setInfo(null)

    let cancelled = false
    let subtitleUrl: string | undefined

    Promise.all([loadSubtitle(path), loadInfo(path)])
      .then(([subUrl, infoData]) => {
        if (cancelled) {
          if (subUrl) URL.revokeObjectURL(subUrl)
          return
        }
        subtitleUrl = subUrl
        setSubtitleUrl(subUrl)
        setInfo(infoData)
      })

    return () => {
      cancelled = true
      if (subtitleUrl) URL.revokeObjectURL(subtitleUrl)
    }
  }, [path])

  return { subtitleUrl, info }
}