'use client';

import type { RequestSentEventResponse } from '~/lib/graphql';
import { decodeData, parseJson } from '~/lib/helpers';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { toHex } from 'viem';
import { create } from 'zustand';

import { Drawer, DrawerContent } from '~/components/ui/drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import { Button } from '../ui/button';
import { TextCopy, TextCopyButton, TextCopyContent } from '../ui/text-copy';

interface DrawerStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  requestData: ParsedRequestData | null;
  setRequestData: (data: ParsedRequestData | null) => void;
}

export const useDrawerStore = create<DrawerStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (open) => set({ isOpen: open }),
  requestData: null,
  setRequestData: (data) => set({ requestData: data }),
}));

type ParsedRequestData = ReturnType<typeof parseRequestData>;

const parseRequestData = (data: string) => {
  const parsed = parseJson(decodeData(data), {}) as {
    codeLocation: bigint;
    language: bigint;
    privateArgs: Uint8Array;
    publicArgs: Uint8Array;
    source: string;
  };

  const privateArgs = decodeData(toHex(parsed.privateArgs))[0] as {
    accessControlConditions: object[];
    ciphertext: string;
    dataToEncryptHash: string;
  };

  const publicArgs = decodeData(toHex(parsed.publicArgs))[0] as object;

  return {
    codeLocation: Number(parsed.codeLocation) === 0 ? 'Inline' : 'IPFS',
    language: Number(parsed.language) === 0 ? 'JavaScript' : 'Other',
    privateArgs,
    publicArgs,
    source: parsed.source,
  };
};

export const columns: ColumnDef<RequestSentEventResponse>[] = [
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
    accessorKey: 'requestingContract',
    header: 'Consumer',
    cell: ({ row }) => {
      const requestingContract = row.original.requestingContract;

      return (
        <TextCopy
          text={requestingContract}
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
    accessorKey: 'subscriptionOwner',
    header: 'Subscription Owner',
    cell: ({ row }) => {
      const subscriptionOwner = row.original.subscriptionOwner;

      return (
        <TextCopy
          text={subscriptionOwner}
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
    accessorKey: 'data',
    header: 'Code Location',
    cell: ({ row }) => {
      const data = row.original.data;
      const parsed = parseRequestData(data);

      return <div>{parsed.codeLocation}</div>;
    },
  },
  {
    accessorKey: 'data',
    header: 'Source',
    cell: ({ row }) => {
      const data = row.original.data;
      const parsed = parseRequestData(data);

      return (
        <TextCopy
          text={parsed.source}
          truncateOptions={{ enabled: true, length: 20, fromMiddle: false }}
          type='text'
        >
          <TextCopyContent />
          <TextCopyButton />
        </TextCopy>
      );
    },
  },
  {
    accessorKey: 'data',
    header: 'Request Details',
    cell: ({ row }) => {
      const data = row.original.data;
      const parsed = parseRequestData(data);

      // eslint-disable-next-line react-hooks/rules-of-hooks -- safe
      const { open, setRequestData } = useDrawerStore();

      return (
        <Button
          size='primary'
          variant='primary'
          onClick={() => {
            setRequestData(parsed);
            open();
          }}
        >
          View Details
        </Button>
      );
    },
  },
];

interface RequestTableProps {
  data: RequestSentEventResponse[];
}

export const RequestsTable = ({ data }: RequestTableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { isOpen, requestData, setOpen, close } = useDrawerStore();

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
      <Drawer open={isOpen} onOpenChange={setOpen}>
        <DrawerContent className=''>
          <div className='mx-auto flex max-w-lg flex-col py-12'>
            <div className='mb-8 text-xl font-medium text-neutral-600 sm:text-xl md:text-2xl'>
              Private Arguments
            </div>
            <div className='flex flex-col gap-2 text-base'>
              <div className='flex flex-row items-start justify-start gap-2 font-medium'>
                <div className='flex w-full max-w-[8rem]'>Cipher Text:</div>{' '}
                <p className='break-all font-normal'>
                  {requestData?.privateArgs.ciphertext}
                </p>
              </div>
              <div className='flex flex-row items-start justify-start gap-2 font-medium'>
                <div className='flex w-full max-w-[8rem]'>Data Hash:</div>{' '}
                <p className='break-all font-normal'>
                  {requestData?.privateArgs.dataToEncryptHash}
                </p>
              </div>
            </div>
            <div className='my-8 text-xl font-medium text-neutral-600 sm:text-xl md:text-2xl'>
              Public Arguments
            </div>
            {Object.entries(requestData?.publicArgs ?? {}).map(([k, v]) => {
              return (
                <div
                  key={k}
                  className='flex flex-col gap-2 text-base font-medium'
                >
                  <div className='flex flex-row items-start justify-start gap-2'>
                    <div className='flex w-full max-w-[8rem]'>{k}:</div>{' '}
                    <p className='break-all font-normal'>{v}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            className='mx-auto mb-5 w-full max-w-lg'
            size='primary'
            variant='primary'
            onClick={close}
          >
            Close
          </Button>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
