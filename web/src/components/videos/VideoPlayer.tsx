import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { formatSize } from '@/lib/utils'
import { getVideoStreamUrl } from '@/api/videos'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'

type VideoPlayerProps = {
  path: string
  onClose: () => void
}

function VideoInfoPanel({ info }: { info: { filename: string; size: number | null; mime_type: string; blake3: string } }) {
  return (
    <div className="px-4 pt-4 pb-2 bg-black/80 text-white text-xs space-y-1">
      <div className="flex items-center gap-4">
        <span className="text-slate-400">Name:</span>
        <span className="truncate">{info.filename}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-400">Size:</span>
        <span>{formatSize(info.size)}</span>
        <span className="text-slate-400 ml-4">Type:</span>
        <span>{info.mime_type}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-400">BLAKE3:</span>
        <span className="font-mono text-[10px] truncate">{info.blake3}</span>
      </div>
    </div>
  )
}

function usePlaybackRate(videoRef: React.RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.playbackRate = 1.25
    }
  }, [videoRef])
}

function usePlayState(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onPause)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onPause)
    }
  }, [videoRef])

  return isPlaying
}

export default function VideoPlayer({ path, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { subtitleUrl, info } = useVideoPlayer(path)
  const isPlaying = usePlayState(videoRef)

  usePlaybackRate(videoRef)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 rounded-xl bg-black overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>

        {info && <VideoInfoPanel info={info} />}

        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent z-[1]" />

          <video
            ref={videoRef}
            className={`w-full max-h-[80vh] [&::-webkit-media-controls-panel]:bg-white/10 ${!isPlaying ? '[&::-webkit-media-controls-panel]:backdrop-blur-md' : ''
              }`}
            src={getVideoStreamUrl(path)}
            controls
            muted
            onClick={(e) => e.preventDefault()} // 👈 阻止点击画面触发默认的“播放/暂停”
          >
            {subtitleUrl && (
              <track
                kind="subtitles"
                src={subtitleUrl}
                srcLang="zh"
                label="Subtitles"
                default
              />
            )}
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  )
}