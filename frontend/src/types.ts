export type VideoInfo = {
  filename: string
  size: number | null
  mime_type: string
  blake3: string
}

export type VideoItem = {
  filename: string
  type: 'f' | 'd'
  created?: number | null
  modified?: number | null
  accessed?: number | null
  size?: number | null
}

export type VideoListResponse = VideoItem[]