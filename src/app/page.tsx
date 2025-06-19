"use server"

import { Table } from './table';
import { TableDataProvider } from './table-data';
import Upload from './upload';

export default async function Home() {
    return (
        <div>
            <TableDataProvider>
                <Upload />
                <Table />
            </TableDataProvider>
        </div>
    );
}
