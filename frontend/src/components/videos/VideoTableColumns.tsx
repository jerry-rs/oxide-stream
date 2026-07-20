import { Trash2, MoreHorizontal, Info } from 'lucide-react'
import { formatSize, formatTimestamp } from '@/lib/utils'
import { type Row } from '@tanstack/react-table'
import type { VideoItem } from '@/types'
import { VideoFileItem } from './VideoFileItem'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

type ColumnActions = {
  onNavigate: (path: string) => void
  onPlay: (path: string) => void
  onDelete: (filename: string) => void,
  onInfo:(filename:string) =>void
}

export function createColumns(currentPath: string, actions: ColumnActions) {
  const { onNavigate, onPlay, onDelete, onInfo } = actions

  return [
    {
      id: 'index',
      header: () => <div className="text-center">#</div>,
      cell: ({ row }: { row: Row<VideoItem> }) => {
        return <div className="text-center">{row.index + 1}</div>
      },
    },
    {
      accessorKey: 'filename',
      header: 'Name',
      cell: ({ row }: { row: { original: VideoItem } }) => {
        const item = row.original
        return (
          <VideoFileItem
            item={item}
            currentPath={currentPath}
            onNavigate={onNavigate}
            onPlay={onPlay}
          />
        )
      },
    },
    {
      accessorKey: 'type',
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }: { row: { original: VideoItem } }) => {
        const type = row.original.type
        return <div className='text-center'>{type === 'd' ? 'folder' : 'video'}</div>
      },
    },
    {
      accessorKey: 'size',
      header: () => <div className="text-center">Size</div>,
      cell: ({ row }: { row: { original: VideoItem } }) => {
        return <div className='text-center whitespace-nowrap'>{formatSize(row.original.size)}</div>
      },
    },
    {
      accessorKey: 'created',
      meta: { className: 'hidden md:table-cell' },
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }: { row: { original: VideoItem } }) => {
        return <div className='text-center whitespace-nowrap'>{formatTimestamp(row.original.created)}</div>
      },
    },
    {
      accessorKey: 'modified',
      meta: { className: 'hidden md:table-cell' },
      header: () => <div className="text-center">Modified</div>,
      cell: ({ row }: { row: { original: VideoItem } }) => {
        return <div className='text-center whitespace-nowrap'>{formatTimestamp(row.original.modified)}</div>
      },
    },
    {
      accessorKey: 'accessed',
      meta: { className: 'hidden md:table-cell' },
      header: () => <div className="text-center">Accessed</div>,
      cell: ({ row }: { row: { original: VideoItem } }) => {
        return <div className='text-center whitespace-nowrap'>{formatTimestamp(row.original.accessed)}</div>
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }: { row: { original: VideoItem } }) => {
        const item = row.original
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none">
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.type === 'f' && (
                  <DropdownMenuItem
                    onClick={() => onInfo(item.filename)}
                  >
                    <Info className="size-4" />
                    Info
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(item.filename)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}