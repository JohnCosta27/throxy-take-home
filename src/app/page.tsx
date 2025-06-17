"use client"

import { FormEvent, useState } from 'react';

const uploadCsv = async (formData: FormData) => {
    return fetch("http://localhost:3000/api/upload", { method: "POST", body: formData }).then(res => res.json());
}

export default function Home() {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [data, setData] = useState<any>();

    console.log(data);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setPending(true);

        const formData = new FormData(e.target as HTMLFormElement);

        uploadCsv(formData).then(data => {
            setPending(false);
            setData(data);
        }).catch(err => {
            setError(err);
        });
    }

    return (
        <div>
            <form onSubmit={onSubmit}>
                <input required name="file" type="file" accept=".csv" />
                <button type="submit">Submit</button>
            </form>
            {pending ? <span>Pending...</span> : error != null ? "" : "parsed successfully"}
            {error && <span>{JSON.stringify(error)}</span>}
        </div>
    );
}
