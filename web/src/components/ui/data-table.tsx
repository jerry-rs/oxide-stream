import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    isLoading?: boolean
    isError?: boolean
  }
}

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  isLoading?: boolean
  isError?: boolean
  loadingMessage?: string
  errorMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  isError,
  loadingMessage = 'Loading...',
  errorMessage = 'Failed to load data.',
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <div className="text-sm text-slate-500">{loadingMessage}</div>
  }

  if (isError) {
    return <div className="text-sm text-rose-600">{errorMessage}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-slate-200 text-left text-slate-600">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className={`px-3 py-2 font-medium ${(header.column.columnDef.meta as { className?: string })?.className ?? ''}`}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={`px-3 py-2 ${(cell.column.columnDef.meta as { className?: string })?.className ?? ''}`}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}