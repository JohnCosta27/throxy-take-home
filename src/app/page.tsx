"use server"

import { Table } from './table';
import { TableDataProvider } from './table-data';
import Upload from './upload';

export default async function Home() {
    return (
        <div className="h-screen flex flex-col p-4">
            <TableDataProvider>
                <Upload />
                <Table />
            </TableDataProvider>
        </div>
    );
}
