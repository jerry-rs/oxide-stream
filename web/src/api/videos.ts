import type { VideoListResponse, VideoInfo,VideoDetailInfo } from '@/types'
import { encodePath, apiFetch, apiFetchText } from './client'
import { ENDPOINTS } from './endpoints'

export async function fetchVideoList(currentPath: string): Promise<VideoListResponse> {
  return apiFetch<VideoListResponse>(ENDPOINTS.videoList(encodePath(currentPath)))
}

export async function deleteVideo(currentPath: string, filename: string): Promise<void> {
  const deletePath = currentPath ? `${currentPath}/${filename}` : filename
  await apiFetch<void>(ENDPOINTS.videoDelete(encodePath(deletePath)), {
    method: 'DELETE',
  })
}

export async function fetchInfoVideo(currentPath: string, filename: string): Promise<void> {
  const infoPath = currentPath ? `${currentPath}/${filename}` : filename
  await apiFetch<void>(ENDPOINTS.videoDelete(encodePath(infoPath)), {
    method: 'GET',
  })
}

export async function fetchSubtitle(path: string): Promise<string> {
  const srtPath = path.replace(/\.\w+$/, '.srt')
  return apiFetchText(ENDPOINTS.videoStream(encodePath(srtPath)))
}

export function getVideoStreamUrl(path: string): string {
  return ENDPOINTS.videoStream(encodePath(path))
}

export async function fetchVideoInfo(path: string): Promise<VideoInfo> {
  return apiFetch<VideoInfo>(ENDPOINTS.videoInfo(encodePath(path)))
}


export async function fetchVideoDetailInfo(path: string): Promise<VideoDetailInfo> {
  return apiFetch<VideoDetailInfo>(ENDPOINTS.videoDetailInfo(encodePath(path)))
}
