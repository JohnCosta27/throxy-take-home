import { CsvRow } from "../api/types"
import { Dot } from "./dot"

export const StatusField = ({ status }: { status: CsvRow['status'] }) => {
    switch (status) {
        case 'pending':
            return <Dot className="bg-gray-700" />
        case 'processing':
            return <Dot className="bg-amber-700" />
        case 'processed':
            return <Dot className="bg-green-600" />
    }
}

