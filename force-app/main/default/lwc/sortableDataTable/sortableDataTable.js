import { LightningElement, api } from 'lwc';
import { dataTableSorter } from 'c/utils';

export default class SortableDataTable extends LightningElement {
    @api tableData;
    @api columns;
    @api defaultSortedBy;
    @api defaultSortedDirection;
    @api hideCheckboxColumn;
    @api showRowNumberColumn;
    @api keyField;
    @api selectedRows;
    @api showMore = false;
    @api defaultShowMoreRows = 10;
  
    eventSortDirection;
    eventSortBy;
    error;
  
    get sortBy() {
      return this.eventSortBy || this.defaultSortedBy;
    }
    get sortDirection() {
      return this.eventSortDirection || this.defaultSortedDirection;
    }
    get sortedData() {
      const rowsSorted = dataTableSorter(this.columns || [])(
        this.sortDirection,
        this.sortBy,
        this.tableData
      );
      return this.showMore ? rowsSorted.splice(0, this.defaultShowMoreRows) : rowsSorted;
    }
  
    get showViewMore() {
      return this.tableDaTaCount > this.defaultShowMoreRows && this.showMore ? true : false;
    }
  
    get tableDaTaCount() {
      return this.tableData.length;
    }
  
    sort = (fieldName, sortedDirection) => {
      this.eventSortBy = fieldName;
      this.eventSortDirection = sortedDirection;
    };
  
    handleSort = event => {
      this.sort(event.detail.fieldName, event.detail.sortDirection);
    };
  
    handleRowAction = event => {
      const rowActionEvent = new CustomEvent('rowactioncalled', {
        detail: event.detail,
      });
      this.dispatchEvent(rowActionEvent);
    };
  
    handleRowSelection = event => {
      const rowsSelectedEvent = new CustomEvent('rowsselected', {
        detail: { selectedRows: event.detail.selectedRows },
      });
      this.dispatchEvent(rowsSelectedEvent);
    };
  
    @api
    getSelectedRows() {
      return this.template.querySelector('c-custom-data-table-cell-types').getSelectedRows();
    }
  
    @api
    resetViewMore() {
      this.showMore = true;
    }
  
    connectedCallback() {
      (this.columns || []).find(column => {
        if (!!column.fieldName && column.fieldName === this.defaultSortedBy && !column.sortable) {
          this.error = `SortableTable warning: You set a default column sort of "${column.fieldName}", but did not set sortable: true on it!`;
          return true;
        }
        return false;
      });
    }
  
    handleViewMore(event) {
      event.preventDefault();
      this.showMore = false;
    }
}