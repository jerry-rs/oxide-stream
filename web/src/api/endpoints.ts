const API_BASE = '/api'

export const ENDPOINTS = {
  videoList: (path: string) => path ? `${API_BASE}/videos/list/${path}` : `${API_BASE}/videos/list/`,
  videoDelete: (path: string) => `${API_BASE}/videos/delete/${path}`,
  videoStream: (path: string) => `${API_BASE}/videos/stream/${path}`,
  videoInfo: (path: string) => `${API_BASE}/videos/info/${path}`,
  videoDetailInfo: (path: string) => `${API_BASE}/videos/detail/info/${path}`,
} as const
