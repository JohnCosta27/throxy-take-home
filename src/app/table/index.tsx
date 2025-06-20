"use client"

import { useMemo, useState } from "react";
import { useTableData } from "../table-data";
import { flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { columns, Meta } from "./columns";
import {
    Table as CNTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
                                    {(header.column.columnDef.meta as Meta)?.filterComponent != null && (header.column.columnDef.meta as Meta)?.filterComponent}
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
