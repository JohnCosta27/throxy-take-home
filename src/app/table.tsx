"use client"

import { useSearchParams } from "next/navigation";
import { CsvRow, getFilteredData } from "./api/companies/route";
import { useEffect, useState } from "react";

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

const getCompanyData = async (searchParams: URLSearchParams) => {
    return fetch(`http://localhost:3000/api/companies?${searchParams}`).then(res => res.json());
}

const columnHelper = createColumnHelper<CsvRow>()

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
    }),
    columnHelper.accessor('city', {
        header: "City",
        cell: info => info.row.original.city ?? <span style={{ color: 'red' }}>{info.row.original.cityRaw}</span>,
    }),
    columnHelper.accessor('country', {
        header: "Country",
        cell: info => info.row.original.country ?? <span style={{ color: 'red' }}>{info.row.original.countryRaw}</span>,
    }),
    columnHelper.accessor('employeeSize', {
        header: "Employee Size",
        cell: info => info.row.original.employeeSize ?? <span style={{ color: 'red' }}>{info.row.original.employeeSizeRaw}</span>,
    }),
]

export const Table = () => {
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Awaited<ReturnType<typeof getFilteredData>> | undefined>(undefined);

    useEffect(() => {
        setLoading(true);
        getCompanyData(searchParams).then((d) => {
            setLoading(false);
            setData(d);
        })
    }, [searchParams]);

    console.log(data);

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) {
        return (
            "Loading..."
        )
    }

    return (
        <table>
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
