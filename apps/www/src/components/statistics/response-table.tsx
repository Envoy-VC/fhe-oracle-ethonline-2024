'use client';

import type { RequestProcessedEventResponse } from '~/lib/graphql';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import { TextCopy, TextCopyButton, TextCopyContent } from '../ui/text-copy';

export const columns: ColumnDef<RequestProcessedEventResponse>[] = [
  {
    accessorKey: 'requestId',
    header: 'Request ID',
    cell: ({ row }) => {
      const requestId = row.original.requestId;

      return (
        <TextCopy
          text={requestId}
          truncateOptions={{ enabled: true, length: 12, fromMiddle: true }}
          type='text'
        >
          <TextCopyContent />
          <TextCopyButton />
        </TextCopy>
      );
    },
  },
  {
    accessorKey: 'subscriptionId',
    header: 'Subscription ID',
  },
  {
    accessorKey: 'transmitter',
    header: 'Transmitter',
    cell: ({ row }) => {
      const transmitter = row.original.transmitter;

      return (
        <TextCopy
          text={transmitter}
          truncateOptions={{ enabled: true, length: 12, fromMiddle: true }}
          type='text'
        >
          <TextCopyContent />
          <TextCopyButton />
        </TextCopy>
      );
    },
  },
  {
    accessorKey: 'response',
    header: 'Response',
    cell: ({ row }) => {
      const data = row.original.response;

      return (
        <TextCopy
          text={data}
          truncateOptions={{ enabled: true, length: 32, fromMiddle: false }}
          type='text'
        >
          <TextCopyContent />
          <TextCopyButton />
        </TextCopy>
      );
    },
  },
  {
    accessorKey: 'err',
    header: 'Error',
    cell: ({ row }) => {
      const data = row.original.err;
      const isError = data === '0x00' ? 'No' : `${data.slice(0, 32)}...`;

      return <div>{isError}</div>;
    },
  },
];

interface RequestTableProps {
  data: RequestProcessedEventResponse[];
}

export const ResponseTable = ({ data }: RequestTableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className='h-24 text-center' colSpan={columns.length}>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
