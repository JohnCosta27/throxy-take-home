"use server"

import { db } from "./api/upload/db"
import { csvRowsTable } from "./api/upload/schema";

export const Table = async () => {
    const data = await db.select().from(csvRowsTable);

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
                {data.map(d => (
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
