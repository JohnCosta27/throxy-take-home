"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import type { getFilteredData } from "./api/utils";

const getCompanyData = async (searchParams: URLSearchParams) => {
    return fetch(`/api/companies?${searchParams}`)
        .then(res => res.json())
        .then((res: Awaited<ReturnType<typeof getFilteredData>>) => {
            return Object.fromEntries(res.map(r => [r.id, r]))
        })
}

const TableDataContext = createContext<Awaited<ReturnType<typeof getCompanyData>>>({});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!);

await supabase.realtime.setAuth(process.env.NEXT_PUBLIC_SUPABASE_KEY!);

export const TableDataProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<Awaited<ReturnType<typeof getCompanyData>>>({});

    const searchParams = useSearchParams();

    useEffect(() => {
        getCompanyData(searchParams).then(setData);
    }, [searchParams]);

    useEffect(() => {
        const changes = supabase
            .channel('csv-rows')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'csvRows',
            }, (payload) => {
                if (payload.eventType === "INSERT" || payload.eventType === 'UPDATE') {
                    setData(d => ({
                        ...d,
                        [payload.new.id]: payload.new,
                    }));
                }
            }).subscribe()

        return () => {
            changes.unsubscribe()
        };
    }, []);

    return (
        <TableDataContext.Provider value={data}>
            {children}
        </TableDataContext.Provider>
    )
}

export const useTableData = () => useContext(TableDataContext);
