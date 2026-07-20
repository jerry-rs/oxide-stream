import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useVideoInfo } from '@/hooks/useVideos'
import { formatSize } from '@/lib/utils'

type VideoInfoDialogProps = {
  currentPath: string
  filename: string | null
  onClose: () => void
}

export function VideoInfoDialog({ currentPath, filename, onClose }: VideoInfoDialogProps) {
  const path = filename ? (currentPath ? `${currentPath}/${filename}` : filename) : ''
  const { data: info, isLoading } = useVideoInfo(path)

  return (
    <AlertDialog open={filename !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Video Info</AlertDialogTitle>
          <AlertDialogDescription>
            Detailed information about the video file.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 px-2 pb-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : info ? (
            <>
              <div className="flex items-start gap-4 text-sm">
                <span className="min-w-[60px] text-muted-foreground">Name:</span>
                <span className="font-medium break-all">{info.filename}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="min-w-[60px] text-muted-foreground">Size:</span>
                <span>{formatSize(info.size)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="min-w-[60px] text-muted-foreground">Type:</span>
                <span>{info.mime_type}</span>
              </div>
              <div className="flex items-start gap-4 text-sm">
                <span className="min-w-[60px] text-muted-foreground">BLAKE3:</span>
                <span className="break-all font-mono text-[10px]">{info.blake3}</span>
              </div>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Failed to load video info.</span>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}