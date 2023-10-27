import React from "react"
import { Button } from "./ui/button"

// Component: Pagination
// Shows the pagination component (1, 2, 3, ..., 10)
// onChangePage is a callback function that is called when the user clicks a page number
interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  isLastPage: boolean
}

const Pagination = (props: { paginationInfo: PaginationInfo, onChangePage: Function }) => {
  const { paginationInfo, onChangePage } = props

  return (
    <div className="w-full flex justify-center gap-2">
      { paginationInfo.currentPage > 2 && <Button variant="secondary" onClick={() => onChangePage(1)}>1</Button> }
      { paginationInfo.currentPage > 3 &&  "..." }
      { paginationInfo.currentPage > 1 && <Button variant="secondary" onClick={() => onChangePage(paginationInfo.currentPage -1)}>{paginationInfo.currentPage -1}</Button> }
      <Button>{paginationInfo.currentPage}</Button>
      { !paginationInfo.isLastPage && paginationInfo.currentPage < paginationInfo.totalPages - 1 && <Button variant="secondary" onClick={() => onChangePage(paginationInfo.currentPage + 1)}>{paginationInfo.currentPage + 1}</Button> }
      { paginationInfo.currentPage < paginationInfo.totalPages - 2 &&  "..." }
      { paginationInfo.currentPage < paginationInfo.totalPages - 1 && <Button variant="secondary" onClick={() => onChangePage(paginationInfo.totalPages)}>{paginationInfo.totalPages}</Button> }
    </div>
  )
}

export { Pagination }
export type { PaginationInfo }
