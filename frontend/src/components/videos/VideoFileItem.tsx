import { Folder, Video } from 'lucide-react'
import type { VideoItem } from '@/types'

type VideoFileItemProps = {
  item: VideoItem
  currentPath: string
  onNavigate: (path: string) => void
  onPlay: (path: string) => void
}

export function VideoFileItem({ item, currentPath, onNavigate, onPlay }: VideoFileItemProps) {
  if (item.type === 'd') {
    const newPath = currentPath ? `${currentPath}/${item.filename}` : item.filename
    return (
      <button
        className="font-medium text-slate-900 hover:text-violet-600"
        onClick={() => onNavigate(newPath)}
      >
        <span className="flex flex-row items-center gap-2">
          <Folder className="size-4 shrink-0 text-sky-500" />
          {item.filename}
        </span>
      </button>
    )
  }

  const videoPath = currentPath ? `${currentPath}/${item.filename}` : item.filename
  return (
    <button
      className="text-slate-700 hover:text-violet-600"
      onClick={() => onPlay(videoPath)}
    >
      <span className="flex flex-row items-center gap-2">
        <Video className="size-4 shrink-0 text-violet-500" />
        {item.filename}
      </span>
    </button>
  )
}