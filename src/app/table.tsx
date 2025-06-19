"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { CsvRow, getFilteredData } from "./api/companies/route";
import { useCallback, useEffect, useState } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
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

const getCompanyData = async (searchParams: URLSearchParams) => {

    return fetch(`http://localhost:3000/api/companies?${searchParams}`).then(res => res.json());
}

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

const TextFilter = () => {
    const createQueryString = useCreateQueryString();

    return (
        <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>
                <input type="text" onChange={e => createQueryString('domain', e.target.value)} />
            </PopoverContent>
        </Popover>
    )
}

const DropdownFilter = ({ options }: { options: string[] }) => {
    const createQueryString = useCreateQueryString();
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
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

export const Table = () => {
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Awaited<ReturnType<typeof getFilteredData>> | undefined>(undefined);

    // TODO: debounce this? It's going to hammer the server.
    useEffect(() => {
        setLoading(true);
        getCompanyData(searchParams).then((d) => {
            setLoading(false);
            setData(d);
        })
    }, [searchParams]);

    const columns = [
        columnHelper.accessor('companyName', {
            header: "Company Name",
            cell: info => {
                return info.row.original.companyName ?? <span style={{ color: 'red' }}>{info.row.original.companyNameRaw}</span>
            },
        }),
        columnHelper.accessor('domain', {
            header: "Domain",
            cell: info => info.row.original.domain ?? <span style={{ color: 'red' }}>{info.row.original.domainRaw}</span>,
            meta: {
                filterComponent: <TextFilter />
            }
        }),
        columnHelper.accessor('city', {
            header: "City",
            cell: info => info.row.original.city ?? <span style={{ color: 'red' }}>{info.row.original.cityRaw}</span>,
        }),
        columnHelper.accessor('country', {
            header: "Country",
            cell: info => info.row.original.country ?? <span style={{ color: 'red' }}>{info.row.original.countryRaw}</span>,
            meta: {
                filterComponent: <TextFilter />
            }
        }),
        columnHelper.accessor('employeeSize', {
            header: "Employee Size",
            cell: info => info.row.original.employeeSize ?? <span style={{ color: 'red' }}>{info.row.original.employeeSizeRaw}</span>,
            meta: {
                filterComponent: <DropdownFilter options={['1-10', '11-50', '51-200', '201-500', '501-1 000', '1 001-5 000', '5 001-10 000', '10 000+']} />
            }
        }),
    ]

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualFiltering: true,
    });

    return (
        <CNTable>
            <TableHeader>
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
