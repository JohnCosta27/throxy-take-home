"use server"

import { Table } from './table';
import Upload from './upload';

export default async function Home() {
    return (
        <div>
            <Upload />
            <Table />
        </div>
    );
}
