"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { CsvRow } from "./api/companies/route";
import { useCallback, useMemo, useState } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import {
    Table as CNTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTableData } from "./table-data";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const columnHelper = createColumnHelper<CsvRow>()

const useCreateQueryString = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    return useCallback(
        (name: string, value: string | undefined) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            const stringParams = params.toString();
            router.push(`${window.location.pathname}?${stringParams}`);
        },
        [searchParams]
    );
}

const TextFilter = ({ name, label }: { name: string; label: string }) => {
    const searchParams = useSearchParams();
    const createQueryString = useCreateQueryString();

    const [open, setOpen] = useState(false);
    const [text, setText] = useState(searchParams.get(name) ?? '');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
                <Chevron />
            </PopoverTrigger>
            <PopoverContent>
                <form onSubmit={(e) => {
                    e.preventDefault();

                    createQueryString(name, text);
                    setOpen(false);
                }} className="flex flex-col gap-2">
                    <input type="submit" hidden />
                    <Label htmlFor="picture">{label} filter</Label>
                    <Input type="text" onChange={e => setText(e.currentTarget.value)} />
                </form>
            </PopoverContent>
        </Popover>
    )
}

const Chevron = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
)

const DropdownFilter = ({ options }: { options: string[] }) => {
    const createQueryString = useCreateQueryString();
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Chevron />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value={value} onValueChange={(v) => {
                    const valueOrUndefined = v === value ? undefined : v;

                    setValue(valueOrUndefined);
                    createQueryString("employee_size", valueOrUndefined);
                }}>
                    {options.map(o => (
                        <DropdownMenuRadioItem key={o} value={o}>{o}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const EnhancedField = ({ status, rawField, field }: { status: CsvRow['status'], rawField: string | null, field: string | null }) => {
    switch (status) {
        case 'pending':
            return <span className="text-gray-700">{rawField ?? ""}</span>
        case 'processing':
            return <span className="text-amber-700">{rawField ?? ""}</span>
        case 'processed':
            return rawField === field
                ? <span className="text-black">{field ?? ""}</span>
                : (
                    <Tooltip>
                        <TooltipTrigger>
                            <span className={rawField === field ? "text-black" : "text-purple-800"}>{field ?? ""}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            Original field: {rawField}
                        </TooltipContent>
                    </Tooltip>
                )
    }
}

const Dot = (props: Partial<HTMLSpanElement>) => {
    return <span className={cn(props.className, "w-2 h-2 rounded-full inline-block")}></span>
}

const StatusField = ({ status }: { status: CsvRow['status'] }) => {
    switch (status) {
        case 'pending':
            return <Dot className="bg-gray-700" />
        case 'processing':
            return <Dot className="bg-amber-700" />
        case 'processed':
            return <Dot className="bg-green-600" />
    }
}

const columns = [
    columnHelper.accessor('status', {
        header: "Status",
        cell: info => <StatusField status={info.row.original.status} />
    }),
    columnHelper.accessor('companyName', {
        header: "Company Name",
        cell: info => <EnhancedField status={info.row.original.status} rawField={info.row.original.companyNameRaw} field={info.row.original.companyName} />
    }),
    columnHelper.accessor('domain', {
        header: "Domain",
        cell: info => <EnhancedField status={info.row.original.status} rawField={info.row.original.domainRaw} field={info.row.original.domain} />,
        meta: {
            filterComponent: <TextFilter name="domain" label="Domain" />
        }
    }),
    columnHelper.accessor('city', {
        header: "City",
        cell: info => <EnhancedField status={info.row.original.status} rawField={info.row.original.cityRaw} field={info.row.original.cityRaw} />,
    }),
    columnHelper.accessor('country', {
        header: "Country",
        cell: info => <EnhancedField status={info.row.original.status} rawField={info.row.original.countryRaw} field={info.row.original.country} />,
        meta: {
            filterComponent: <TextFilter name="country" label="Country" />
        }
    }),
    columnHelper.accessor('employeeSize', {
        header: "Employee Size",
        cell: info => <EnhancedField status={info.row.original.status} rawField={info.row.original.employeeSizeRaw} field={info.row.original.employeeSize} />,
        meta: {
            filterComponent: <DropdownFilter options={['1-10', '11-50', '51-200', '201-500', '501-1 000', '1 001-5 000', '5 001-10 000', '10 000+']} />
        }
    }),
    columnHelper.accessor('createdAt', {
        header: "Created At",
        cell: info => new Date(info.row.original.createdAt).toISOString(),
    })
]


export const Table = () => {
    const data = useTableData();
    const arrayData = useMemo(() => Object.values(data), [data]);

    const [sortingState, setSortingState] = useState<SortingState>([
        {
            id: "createdAt",
            desc: true,
        }
    ]);

    const table = useReactTable({
        data: arrayData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualFiltering: true,
        onSortingChange: setSortingState,
        state: {
            sorting: sortingState,
        }
    });

    return (
        <CNTable>
            <TableHeader className="sticky top-0 bg-white">
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => {
                            return (
                                <TableHead key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                    {header.column.columnDef.meta?.filterComponent != null && header.column.columnDef.meta?.filterComponent}
                                </TableHead>
                            )
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </CNTable>
    )
}
