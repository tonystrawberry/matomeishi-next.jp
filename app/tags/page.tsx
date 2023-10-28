"use client" // This is a client component 👈🏽

// URL: /tags
// This page allows the user to view all tags and access the tag individual pages.

import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tag, TagResponse } from "@/types/BusinessCard"
import { useRouter } from "next/navigation"
import React, { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../contexts/authContext"
import withAuth from "../../components/withAuth"
import { User } from "firebase/auth"
import { toast } from "@/components/ui/use-toast"
import { PenSquare, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Tags() {
  const router = useRouter()
  const { user } = useContext(AuthContext) as { user: User }

  const [tags, setTags] = useState<Tag[]>([]) // Corresponds to the tags that are displayed
  const [sorting, setSorting] = useState<SortingState>([]) // Corresponds to the sorting state of the table
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]) // Corresponds to the column filters of the table
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({}) // Corresponds to the column visibility of the table
  const [rowSelection, setRowSelection] = useState({}) // Corresponds to the row selection of the table

  const columns: ColumnDef<Tag>[] = [
    // TODO: Add select for bulk actions later
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={table.getIsAllPageRowsSelected()}
    //       onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value: any) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const tag = row.original
        return <Badge style={{ backgroundColor: tag.color }}>{tag.name}</Badge>
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
      accessorKey: "business_cards_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Count
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("business_cards_count")}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const tag = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/tags/${tag.id}`)}>
                <PenSquare className="mr-2 h-4 w-4" />
                Edit Tag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: tags,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  useEffect(() => {
    fetchTags()
  }, [])

  /***** Functions *****/

  // Function to fetch tags from API
  const fetchTags = async () => {
    try {
      const firebaseToken = await user.getIdToken() // Get the Firebase access token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags`,
        { headers: { "x-firebase-token": firebaseToken } }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch the tags | ${response.status}`, )
      }

      const data = (await response.json()) as { data: TagResponse[] }

      // Add all tags to the search tags below the search bar
      // Also set the selected property to true if the tag is in the query string
      const tags = data.data.map((tag) => {
        return tag.attributes
      })

      setTags(tags)
    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })

      setTags([])
    }
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Button
          variant="secondary"
          onClick={() => {
            router.push("/cards")
          }}
        >
          Back
        </Button>
        <Separator className="my-4" />

        <div className="flex items-center">
          <TagIcon className="mr-2 h-6 w-6" />

          <h1 className="text-2xl font-semibold">Tags</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          You can view all tags here. Tags are used to categorize business cards
          and make them easier to find.
        </p>

        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by name..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />

            <div className="flex-1 text-sm text-muted-foreground mx-2 flex-nowrap">
              {table.getFilteredRowModel().rows.length} tag(s)
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default withAuth(Tags)
