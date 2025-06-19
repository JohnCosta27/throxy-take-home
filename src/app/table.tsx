"use client"

import { useSearchParams } from "next/navigation";
import { getFilteredData } from "./api/companies/route";
import { useEffect, useState } from "react";

const getCompanyData = async (searchParams: URLSearchParams) => {
    return fetch(`http://localhost:3000/api/companies?${searchParams}`).then(res => res.json());
}

export const Table = () => {
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Awaited<ReturnType<typeof getFilteredData>> | undefined>(undefined);

    useEffect(() => {
        setLoading(true);
        getCompanyData(searchParams).then((d) => {
            setLoading(false);
            debugger;
            setData(d);
        })
    }, [searchParams]);

    if (loading) {
        return (
            "Loading..."
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Company Name</th>
                    <th>Domain</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Employee Size</th>
                </tr>
            </thead>
            <tbody>
                {data?.map(d => (
                    <tr key={d.id}>
                        <td>{d.companyName ?? d.companyNameRaw}</td>
                        <td>{d.domain ?? d.domainRaw}</td>
                        <td>{d.city ?? d.cityRaw}</td>
                        <td>{d.country ?? d.countryRaw}</td>
                        <td>{d.employeeSize ?? d.employeeSizeRaw}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
