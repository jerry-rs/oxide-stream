import { useMemo, useState } from 'react'
import { useVideoList, useDeleteVideo } from '@/hooks/useVideos'
import { VideoInfoDialog } from '@/components/videos/VideoInfoDialog'
import { DataTable } from '@/components/ui/data-table'
import type { VideoItem } from '@/types'
import VideoPlayer from '@/components/videos/VideoPlayer'
import { createColumns } from '@/components/videos/VideoTableColumns'
import { DeleteVideoDialog } from '@/components/videos/DeleteVideoDialog'

type VideoTableProps = {
  currentPath: string
  onPathChange: (path: string) => void
}

export default function VideoTable({ currentPath, onPathChange }: VideoTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [infoTarget, setInfoTarget] = useState<string | null>(null)
  const [playTarget, setPlayTarget] = useState<string | null>(null)

  const { data, isLoading, isError } = useVideoList(currentPath)
  const deleteMutation = useDeleteVideo(currentPath)

  const columns = useMemo(
    () =>
      createColumns(currentPath, {
        onNavigate: (path) => onPathChange(path),
        onPlay: (path) => setPlayTarget(path),
        onDelete: (filename) => setDeleteTarget(filename),
        onInfo: (filename) =>  setInfoTarget(filename),
    
      }),
    [currentPath, onPathChange],
  )

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {playTarget && <VideoPlayer path={playTarget} onClose={() => setPlayTarget(null)} />}

      <DeleteVideoDialog
        filename={deleteTarget}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget, {
              onSettled: () => setDeleteTarget(null),
            })
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <VideoInfoDialog
        currentPath={currentPath}
        filename={infoTarget}
        onClose={() => setInfoTarget(null)}
      />

      <DataTable<VideoItem>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        loadingMessage="Loading..."
        errorMessage="Failed to load videos."
      />
    </div>
  )
}
