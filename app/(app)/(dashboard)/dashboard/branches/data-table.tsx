"use client";

import {
  type CellContext,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type HeaderContext,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBranchAction } from "./actions";

export type BranchRow = {
  id: string;
  slug: string | null;
  name: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

function ActionsCell({ id }: { id: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0" variant="ghost">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/branches/${id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={deleteBranchAction}>
          <input name="id" type="hidden" value={id} />
          <DropdownMenuItem asChild>
            <button type="submit">Delete</button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BranchesDataTable({ rows }: { rows: BranchRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<BranchRow>[] = useMemo(
    () => [
      {
        id: "select",
        header: (ctx: HeaderContext<BranchRow, unknown>) => (
          <Checkbox
            aria-label="Select all"
            checked={
              ctx.table.getIsAllPageRowsSelected() ||
              (ctx.table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              ctx.table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: (ctx: CellContext<BranchRow, unknown>) => (
          <Checkbox
            aria-label="Select row"
            checked={ctx.row.getIsSelected()}
            onCheckedChange={(value) => ctx.row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: (ctx: HeaderContext<BranchRow, unknown>) => (
          <Button
            onClick={() =>
              ctx.column.toggleSorting(ctx.column.getIsSorted() === "asc")
            }
            variant="ghost"
          >
            Name
            <ArrowUpDown />
          </Button>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: (ctx: CellContext<BranchRow, unknown>) => (
          <div>{ctx.row.getValue("slug") || "—"}</div>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (ctx: CellContext<BranchRow, unknown>) => {
          const v = String(ctx.row.getValue("createdAt") || "");
          const d = Number.isNaN(Date.parse(v)) ? null : new Date(v);
          return <span>{d ? format(d, "yyyy-MM-dd HH:mm") : "—"}</span>;
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: (ctx: CellContext<BranchRow, unknown>) => {
          const v = String(ctx.row.getValue("updatedAt") || "");
          const d = Number.isNaN(Date.parse(v)) ? null : new Date(v);
          return <span>{d ? format(d, "yyyy-MM-dd HH:mm") : "—"}</span>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: (ctx: CellContext<BranchRow, unknown>) => (
          <ActionsCell id={ctx.row.original.id} />
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          className="max-w-sm"
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          placeholder="Filter name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-auto" variant="outline">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  className="capitalize"
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild className="ml-2">
          <Link href="/dashboard/branches/new">Add branch</Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
