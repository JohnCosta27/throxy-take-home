import { createColumnHelper } from "@tanstack/react-table"
import { CsvRow } from "../api/types"
import { StatusField } from "./status-field"
import { EnhancedField } from "./enhanced-field"
import { TextFilter } from "./text-filter"
import { DropdownFilter } from "./dropdown-filter"
import { ReactNode } from "react"

const columnHelper = createColumnHelper<CsvRow>()

export type Meta = {
    filterComponent?: ReactNode
}

export const columns = [
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
        cell: info => new Date(info.row.original.createdAt!).toISOString(),
    })
]
