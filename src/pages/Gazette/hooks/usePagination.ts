import { useState } from 'react';

const ITEMS_PER_PAGE = 20;

export function usePagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // This should be calculated based on total items

  const setPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return {
    currentPage,
    totalPages,
    setPage,
  };
}