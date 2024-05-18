import { LightningElement, track } from "lwc";
import updateRecords from "@salesforce/apex/ContactUpdaterController.updateRecords";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
const CSV_COLUMNS = [
  {
    label: "Email",
    fieldName: "Email",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Name",
    fieldName: "Name",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Title",
    fieldName: "Title",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Main Market",
    fieldName: "Main_Market__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Sub Market",
    fieldName: "Sub_Market__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Business Phone",
    fieldName: "Phone",
    hideDefaultActions: true,
    sortable: true
  }
];

const UPDATED_COLUMNS = [
  {
    label: "Email",
    fieldName: "Email",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Title",
    fieldName: "Title",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Main Market",
    fieldName: "Main_Market__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Sub Market",
    fieldName: "Sub_Market__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Business Phone",
    fieldName: "Phone",
    hideDefaultActions: true,
    sortable: true
  }
];

export default class ContactUpdater extends LightningElement {
  @track csvRecords = [];
  @track mapContacts = {};
  @track recordsUpdated = [];
  showCsvTable = false;
  showUpdatedTable = false;
  loading = false;

  csvColumns = CSV_COLUMNS;
  updatedColumns = UPDATED_COLUMNS;

  get showInputFile() {
    return !this.showCsvTable && !this.showUpdatedTable;
  }
  get recordsToUpdate() {
    return this.showCsvTable && !this.showUpdatedTable;
  }

  get recordsWereUpdated() {
    return !this.showCsvTable && this.showUpdatedTable;
  }

  get isCancel() {
    return this.showCsvTable && !this.showUpdatedTable;
  }

  get readyToUpdate() {
    return this.showCsvTable && this.csvRecords.length > 0;
  }

  get isReset() {
    return this.showUpdatedTable && this.recordsUpdated.length > 0;
  }

  handleFileLoaded(event) {
    this.loading = true;
    let records = event.detail.records;
    records.forEach((record) => {
      const newRecord = {
        Email: record?.Email,
        Name: record?.Name,
        Title: record?.Title,
        Main_Market__c: record?.Phone,
        Sub_Market__c: record?.Main_Market,
        Phone: record?.Sub_Market
      };
      console.log("newRecord", newRecord);
      //add conditional to name
      if (newRecord.Email != null) {
        //console.log("newRecord.Name", newRecord.Email);
        this.csvRecords.push(newRecord);
        this.mapContacts[newRecord.Email] = newRecord;
      }
    });
    //console.log("csvRecords", JSON.stringify(this.csvRecords));
    this.showCsvTable = true;
    this.showUpdatedTable = false;
    this.loading = false;
  }

  handleUpdate() {
    this.loading = true;
    console.log("mapContacts", JSON.stringify(this.mapContacts));
    //remove the .Name from the mapContacts
    Object.keys(this.mapContacts).forEach((key) => {
      delete this.mapContacts[key].Name;
    });
    //console.log("mapContacts", JSON.stringify(this.mapContacts));

    updateRecords({ csvContactsMap: this.mapContacts })
      .then((result) => {
        //console.log("result", result);
        this.recordsUpdated = result;
        this.showCsvTable = false;
        this.showUpdatedTable = true;
        this.loading = false;
        const toastEvent = new ShowToastEvent({
          title: "Update successfully completed",
          variant: "success"
        });
        this.dispatchEvent(toastEvent);
      })
      .catch((error) => {
        console.log("error", error);
        this.loading = false;
        const toastEvent = new ShowToastEvent({
          title: "Location code updater fails",
          message: error.body.message,
          variant: "error"
        });
        this.dispatchEvent(toastEvent);
      });
  }

  handleReset() {
    this.csvRecords = [];
    this.recordsUpdated = [];
    this.showCsvTable = false;
    this.showUpdatedTable = false;
  }
}