import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// Define the shape of the data for each row
interface RowData {
  [key: string]: string | number | React.ReactNode; // This can be extended if needed
}

// Define the shape of each column
interface Column {
  accessor: string;
  Header: string;
  Cell?: (props: { value: string | number | React.ReactNode; row: RowData }) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: RowData[];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto w-full">
      <Table className="min-w-full">
        <TableHeader >
          <TableRow >
            {columns.map((column) => (
              <TableHead
                key={column.accessor}
                className="text-black
                font-bold  whitespace-nowrap py-2 px-4 py-4 text-left"
              >
                {column.Header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className="hover:bg-gray-100">
              {columns.map((column) => (
                <TableCell key={column.accessor} className="py-4 px-4">
                  {column.Cell ? column.Cell({ value: row[column.accessor], row }) : row[column.accessor]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export { DataTable };
