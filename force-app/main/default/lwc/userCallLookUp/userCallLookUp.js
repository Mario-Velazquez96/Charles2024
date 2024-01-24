import { api, LightningElement, track, wire } from "lwc";
import lookUp from "@salesforce/apex/notesSearcherLookupController.search";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class UserCallLookUp extends LightningElement {
  @api recordId;
  @api recordName;
  @api objName;
  @api iconName;
  @api filter = "";
  @api searchPlaceholder = "Search";
  @track selectedName;
  @track selectedId;
  @track records;
  @track isValueSelected;
  @track blurTimeout;
  searchTerm;
  startDate;
  endDate;

  startDateDT;
  endDateDT;
  //css
  @track boxClass =
    "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus";
  @track inputClass = "";
  //think can be deleted
  connectedCallback() {
    if (!!this.recordId) {
      this.isValueSelected = true;
      this.selectedId = this.recordId;
      this.selectedName = this.recordName;
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
      }
      this.boxClass =
        "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus";
    }
  }
  //finish think can be deleted

  @wire(lookUp, {
    searchTerm: "$searchTerm",
    myObject: "$objName",
    filter: "$filter"
  })
  wiredRecords({ error, data }) {
    if (data) {
      this.error = undefined;
      this.records = data;
    } else if (error) {
      this.error = error;
      this.records = undefined;
    }
  }

  handleClick() {
    this.searchTerm = "";
    this.inputClass = "slds-has-focus";
    this.boxClass =
      "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open";
  }

  onBlur() {
    this.blurTimeout = setTimeout(() => {
      this.boxClass =
        "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus";
    }, 300);
  }

  onSelect(event) {
    let selectedId = event.currentTarget.dataset.id;
    let selectedName = event.currentTarget.dataset.name;
    this.isValueSelected = true;
    this.selectedId = selectedId;
    this.selectedName = selectedName;
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
    this.boxClass =
      "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus";
  }

  handleRemovePill() {
    this.isValueSelected = false;
    this.dispatchEvent(
      new CustomEvent("recordremove", {
        detail: this.selectedId,
        bubbles: true,
        composed: true
      })
    );
  }

  onChange(event) {
    this.searchTerm = event.target.value;
  }

  handleSearchClick() {
    if (this.startDate >= this.endDate && this.endDate) {
      this.showToast(
        "Start date value cannot be greater than end date value",
        "Error",
        "error"
      );
      return;
    }
    console.log("test", this.selectedId);
    // let query = this.buildDateQuery('CreatedDate');
    this.dispatchEvent(
      new CustomEvent("recordsearch", {
        detail: {
          selectedId: this.selectedId,
          startDate: this.startDate,
          endDate: this.endDate
        },
        bubbles: true,
        composed: true
      })
    );
  }

  handleChangeStartValue(event) {
    this.startDate = event.target.value;
  }

  handleChangeEndValue(event) {
    this.endDate = event.target.value;
  }

  // buildDateQuery(fieldName){
  //     let objectQueryString;

  //     if(!!this.startDate){
  //         objectQueryString = fieldName + ' >= ' + this.startDate;
  //     }
  //     if(!!this.endDate){
  //         if (!!objectQueryString){
  //             objectQueryString +=  ` AND ${fieldName} <= ${this.endDate}`;
  //             objectQueryString = `(${objectQueryString})`;
  //         } else {
  //             objectQueryString = fieldName + ' <= ' + this.endDate;

  //         }
  //     }

  //     console.log('QUERYSTRING', objectQueryString);
  //     return objectQueryString;
  // }

  showToast(message, title, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  get isDisabled() {
    return this.startDate || this.endDate ? false : true;
  }
}