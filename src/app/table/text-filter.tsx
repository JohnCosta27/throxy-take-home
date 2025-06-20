import { useSearchParams } from "next/navigation";
import { useCreateQueryString } from "./use-create-query-string";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Chevron } from "./Chevron";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const TextFilter = ({ name, label }: { name: string; label: string }) => {
    const searchParams = useSearchParams();
    const createQueryString = useCreateQueryString();

    const [open, setOpen] = useState(false);
    const [text, setText] = useState(searchParams.get(name) ?? '');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
                <Chevron />
            </PopoverTrigger>
            <PopoverContent>
                <form onSubmit={(e) => {
                    e.preventDefault();

                    createQueryString(name, text);
                    setOpen(false);
                }} className="flex flex-col gap-">
                    <input type="submit" hidden />
                    <Label htmlFor="picture">{label} filter</Label>
                    <Input type="text" value={text} onChange={e => setText(e.currentTarget.value)} />
                </form>
            </PopoverContent>
        </Popover>
    )
}
