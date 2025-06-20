"use client"

import { FormEvent } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const uploadCsv = async (formData: FormData) => {
    return fetch("/api/upload", { method: "POST", body: formData }).then(res => res.json());
}

export function Upload() {
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        uploadCsv(formData);
    }

    return (
        <Popover>
            <PopoverTrigger>
                Upload File
            </PopoverTrigger>
            <PopoverContent>
                <form className="grid w-full max-w-sm items-center gap-3" onSubmit={onSubmit}>
                    <Label htmlFor="picture">CSV File</Label>
                    <Input required name="file" type="file" accept=".csv" />
                    <Button type="submit" variant="outline">Submit</Button>
                </form>
            </PopoverContent>
        </Popover>
    );
}
