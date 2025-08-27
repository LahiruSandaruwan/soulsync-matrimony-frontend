import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  // Original interface support
  @Input() pagination?: PaginationInfo;
  
  // New interface support (for browse components)
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 20;
  
  @Input() showInfo: boolean = true;
  @Input() maxVisiblePages: number = 5;
  
  @Output() pageChange = new EventEmitter<number>();

  get totalPagesCount(): number {
    return this.pagination?.last_page || this.totalPages;
  }

  get currentPageNumber(): number {
    return this.pagination?.current_page || this.currentPage;
  }

  get hasPreviousPage(): boolean {
    return this.currentPageNumber > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPageNumber < this.totalPagesCount;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPagesCount;
    const currentPage = this.currentPageNumber;
    const maxVisible = this.maxVisiblePages;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end pages
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  get showFirstPage(): boolean {
    return this.visiblePages[0] > 1;
  }

  get showLastPage(): boolean {
    return this.visiblePages[this.visiblePages.length - 1] < this.totalPagesCount;
  }

  get showLeftEllipsis(): boolean {
    return this.visiblePages[0] > 2;
  }

  get showRightEllipsis(): boolean {
    return this.visiblePages[this.visiblePages.length - 1] < this.totalPagesCount - 1;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPagesCount && page !== this.currentPageNumber) {
      this.pageChange.emit(page);
    }
  }

  onPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.onPageChange(this.currentPageNumber - 1);
    }
  }

  onNextPage(): void {
    if (this.hasNextPage) {
      this.onPageChange(this.currentPageNumber + 1);
    }
  }

  onFirstPage(): void {
    this.onPageChange(1);
  }

  onLastPage(): void {
    this.onPageChange(this.totalPagesCount);
  }

  getPageInfoText(): string {
    if (this.pagination) {
      const { from, to, total } = this.pagination;
      return `Showing ${from} to ${to} of ${total} results`;
    } else {
      const from = (this.currentPageNumber - 1) * this.itemsPerPage + 1;
      const to = Math.min(this.currentPageNumber * this.itemsPerPage, this.totalItems);
      return `Showing ${from} to ${to} of ${this.totalItems} results`;
    }
  }

  getPageRangeText(): string {
    if (this.pagination) {
      const { current_page, last_page } = this.pagination;
      return `Page ${current_page} of ${last_page}`;
    } else {
      return `Page ${this.currentPageNumber} of ${this.totalPagesCount}`;
    }
  }
} 