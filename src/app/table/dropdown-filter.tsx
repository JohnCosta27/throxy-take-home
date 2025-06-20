import { useState } from "react";
import { useCreateQueryString } from "./use-create-query-string";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Chevron } from "./Chevron";

export const DropdownFilter = ({ options }: { options: string[] }) => {
    const createQueryString = useCreateQueryString();
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Chevron />
            </DropdownMenuTrigger>
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

