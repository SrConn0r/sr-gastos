"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnMeta,
    SortingState,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    Column,
} from "@tanstack/react-table";

interface CustomColumnMeta {
    centered?: boolean;
    size?: string;
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> extends CustomColumnMeta {
        filterVariant?: "text" | "range" | "select" | "boolean";
    }
}

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import React from "react";
import { Input } from "./input";
import { DataTablePagination } from "./data-table-pagination";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./select";
import { Button } from "./button";
import { FilterX, Heart } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    columnSelectFilter?: ColumnSelectFilter | ColumnSelectFilter[];
}

interface SelectData {
    value: string | number;
    label: string;
}

interface ColumnSelectFilter {
    selectData?: SelectData[];
    placeholder?: string;
    column: string;
}

function Filter({
    column,
    selectData,
    placeholder,
}: {
    column: Column<any, unknown>;
    selectData: SelectData[];
    placeholder: string;
}) {
    const columnFilterValue = column.getFilterValue();
    const { filterVariant } = column.columnDef.meta ?? {};

    return filterVariant === "select" ? (
        <Select
            onValueChange={(value) => {
                column.setFilterValue(value);
            }}
            value={(columnFilterValue ?? "") as string}
        >
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {selectData.map((item) => (
                        <SelectItem key={item.value} value={item.value.toString()}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    ) : null;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    columnSelectFilter,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "auto",
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
        },
    });

    return (
        <>
            <div className="flex flex-col sm:flex-row items-center py-4 gap-4 w-full">
                <Input
                    placeholder="Search"
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(String(event.target.value))}
                    className="w-full sm:max-w-lg"
                />

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {columnSelectFilter && !Array.isArray(columnSelectFilter) && (
                        <Filter
                            column={
                                table.getColumn(`${columnSelectFilter.column}`) as Column<
                                    any,
                                    unknown
                                >
                            }
                            selectData={columnSelectFilter.selectData ?? []}
                            placeholder={columnSelectFilter.placeholder ?? ""}
                        />
                    )}
                    {columnSelectFilter &&
                        Array.isArray(columnSelectFilter) &&
                        columnSelectFilter.map((filter) => (
                            <Filter
                                key={filter.column}
                                column={
                                    table.getColumn(`${filter.column}`) as Column<any, unknown>
                                }
                                selectData={filter.selectData ?? []}
                                placeholder={filter.placeholder ?? ""}
                            />
                        ))}
                </div>

                <Button
                    variant="outline"
                    onClick={() => {
                        table.resetColumnFilters();
                        table.resetGlobalFilter();
                    }}
                    className="w-full sm:w-auto sm:ml-auto"
                >
                    <FilterX />
                    Limpiar Filtros
                </Button>
            </div>

            <div className="rounded-md border shadow border-slate-200 overflow-hidden">
                <Table>
                    {/* Header */}
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-white">
                                {headerGroup.headers.map((header) => {
                                    const isCentered = header.column.columnDef.meta?.centered;

                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`${isCentered ? "text-center" : "text-left"
                                                } border border-slate-200 font-semibold text-slate-900`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/* Body */}
                    <TableBody className="overflow-auto">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-slate-100"
                                        }`}
                                >
                                    {row.getVisibleCells().map((cell, index) => {
                                        const isCentered = cell.column.columnDef.meta?.centered;

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={`border border-slate-200 ${isCentered ? "text-center" : "text-left"
                                                    }`}
                                                width={cell.column.columnDef.meta?.size}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center border border-slate-200"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="p-4">
                <DataTablePagination table={table} />
            </div>
            {/* <pre>
                {JSON.stringify(
                    { columnFilters: table.getState().columnFilters },
                    null,
                    2
                )}
            </pre> */}
        </>
    );
}
