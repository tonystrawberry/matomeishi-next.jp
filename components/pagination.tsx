import React, { ComponentProps, useContext } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/app/firebase";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  isLastPage: boolean;
}

const Pagination = (props: { paginationInfo: PaginationInfo, changePage: Function }) => {
  const { paginationInfo, changePage } = props;

  return (
    <div className="w-full flex justify-center gap-2">
      { paginationInfo.currentPage > 2 && <Button variant="secondary" onClick={() => changePage(1)}>1</Button> }
      { paginationInfo.currentPage > 2 &&  "..." }
      { paginationInfo.currentPage > 1 && <Button variant="secondary" onClick={() => changePage(paginationInfo.currentPage -1)}>{paginationInfo.currentPage -1}</Button> }
      <Button variant="secondary">{paginationInfo.currentPage}</Button>
      { !paginationInfo.isLastPage && <Button variant="secondary" onClick={() => changePage(paginationInfo.currentPage + 1)}>{paginationInfo.currentPage + 1}</Button> }
      { paginationInfo.currentPage < paginationInfo.totalPages - 2 &&  "..." }
      { paginationInfo.currentPage < paginationInfo.totalPages - 1 && <Button variant="secondary" onClick={() => changePage(paginationInfo.totalPages)}>{paginationInfo.totalPages}</Button> }
    </div>
  );
};

export { Pagination };
export type { PaginationInfo };
