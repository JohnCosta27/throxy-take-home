"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getFilteredData } from "./api/companies/route";
import { useSearchParams } from "next/navigation";

const TableDataContext = createContext<{ data: Awaited<ReturnType<typeof getFilteredData>>, refetch: () => void }>({ data: [], refetch: () => { } });

const getCompanyData = async (searchParams: URLSearchParams) => {
    return fetch(`http://localhost:3000/api/companies?${searchParams}`).then(res => res.json());
}

export const TableDataProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<Awaited<ReturnType<typeof getFilteredData>>>([]);

    const searchParams = useSearchParams();

    const refetchData = useCallback(() => {
        getCompanyData(searchParams).then(setData)
    }, [searchParams]);

    useEffect(() => {
        refetchData();
    }, [refetchData]);

    return (
        <TableDataContext.Provider value={{ data, refetch: refetchData }}>
            {children}
        </TableDataContext.Provider>
    )
}

export const useTableData = () => useContext(TableDataContext);
