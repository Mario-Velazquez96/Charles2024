import { LightningElement, api } from "lwc";

export default class UserCallDataTable extends LightningElement {
  @api recordList;
  @api columns;
  @api sortedBy;
  @api sortDirection;
  defaultSortedBy = "CreatedDate";
  defaultSortDirection = "desc";
  pageData = [];

  // connectedCallback() {
  //   (this.columns || []).find((column) => {
  //     if (
  //       !!column.fieldName &&
  //       column.fieldName === this.defaultSortedBy &&
  //       !column.sortable
  //     ) {
  //       this.error = `SortableTable warning: You set a default column sort of "${column.fieldName}", but did not set sortable: true on it!`;
  //       return true;
  //     }
  //     return false;
  //   });
  // }

  onHandleSort(event) {
    var fieldName = event.detail.fieldName;
    var sortedDirection = event.detail.sortDirection;
    this.sortedBy = fieldName;
    this.sortDirection = sortedDirection;
    this.sortData(fieldName, sortedDirection);
    //this.updatePage();
  }

  sortData(fieldname, direction) {
    let parseData = JSON.parse(JSON.stringify(this.recordList));
    let keyValue = (a) => {
      return a[fieldname];
    };
    let isReverse = direction === "asc" ? 1 : -1;
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : "";
      y = keyValue(y) ? keyValue(y) : "";
      return isReverse * ((x > y) - (y > x));
    });
    this.recordList = parseData;
  }
}