import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CsvRow } from "../api/types"

export const EnhancedField = ({ status, rawField, field }: { status: CsvRow['status'], rawField: string | undefined | null, field: string | undefined | null }) => {
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
