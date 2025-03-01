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
import React, { useEffect } from "react";
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
import { FilterX, LayoutGrid, List } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    columnSelectFilter?: ColumnSelectFilter | ColumnSelectFilter[];
    changeLayout?: boolean;
    children?: (rowData: TData) => React.ReactNode;
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
                console.log(value);
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
    changeLayout = false,
    children,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [rowSelection, setRowSelection] = React.useState({});
    const [isGridView, setIsGridView] = React.useState(false);

    const isMobile = useMediaQuery("(max-width: 767px)");

    useEffect(() => {
        setIsGridView(isMobile);
    }, [isMobile])


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
                {changeLayout && (
                    <div className="hidden md:flex gap-4">
                        <Button
                            onClick={() => {
                                setIsGridView(false);
                            }}
                            variant={isGridView ? "outline" : "secondary"}
                        >
                            <List />
                        </Button>
                        <Button
                            onClick={() => {
                                setIsGridView(true);
                            }}
                            variant={isGridView ? "secondary" : "outline"}
                        >
                            <LayoutGrid />
                        </Button>
                    </div>
                )}

                <Button
                    variant="secondary"
                    onClick={() => {
                        table.resetColumnFilters();
                        table.resetGlobalFilter();
                    }}
                    className="w-full sm:w-auto sm:ml-auto"
                >
                    <FilterX />
                    Clear Filters
                </Button>
            </div>
            {isGridView ? (
                <>
                    {children ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {table.getRowModel().rows.map((row) => (
                                <div key={row.id}>{children(row.original)}</div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {table.getRowModel().rows.map((row) => (
                                <div
                                    key={row.id}
                                    className="bg-card text-card-foreground rounded-lg shadow-md p-4"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <div key={cell.id} className="mb-2">
                                            <strong className="capitalize">{cell.column.id}: </strong>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="rounded-md border shadow-md border-slate-200 overflow-hidden">
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
            )}
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
