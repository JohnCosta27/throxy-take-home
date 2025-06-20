"use client"

import { FormEvent, useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const uploadCsv = async (formData: FormData) => {
    return fetch("http://localhost:3000/api/upload", { method: "POST", body: formData }).then(res => res.json());
}

export default function Upload() {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setPending(true);

        const formData = new FormData(e.target as HTMLFormElement);

        uploadCsv(formData).then(() => {
            setPending(false);
        }).catch(err => {
            setError(err);
        });
    }

    return (
        <Popover>
            <PopoverTrigger>
                <Button type="button" variant="outline">Upload File</Button>
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
