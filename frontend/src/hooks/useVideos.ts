import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchVideoList, deleteVideo, fetchVideoInfo } from '@/api/videos'
import type { VideoListResponse } from '@/types'

export function useVideoList(currentPath: string) {
  return useQuery<VideoListResponse>({
    queryKey: ['videos', currentPath],
    queryFn: () => fetchVideoList(currentPath),
  })
}

export function useDeleteVideo(currentPath: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (filename: string) => {
      await deleteVideo(currentPath, filename)
    },
    onMutate: async (filename) => {
      await queryClient.cancelQueries({ queryKey: ['videos', currentPath] })

      const previousData = queryClient.getQueryData<VideoListResponse>(['videos', currentPath])

      if (previousData) {
        queryClient.setQueryData<VideoListResponse>(['videos', currentPath],
          previousData.filter((item) => item.filename !== filename),
        )
      }

      return { previousData }
    },
    onError: (_err, _filename, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['videos', currentPath], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', currentPath] })
    },
  })
}

export function useVideoInfo(path: string) {
  return useQuery({
    queryKey: ['video-info', path],
    queryFn: () => fetchVideoInfo(path),
    enabled: !!path,
  })
}
