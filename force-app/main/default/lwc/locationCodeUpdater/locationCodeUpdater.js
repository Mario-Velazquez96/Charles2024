import { LightningElement, track } from "lwc";
import updateRecords from "@salesforce/apex/LocationCodeUpdaterController.updateRecords";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
const CSV_COLUMNS = [
  {
    label: "School Name",
    fieldName: "Name",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "City",
    fieldName: "ShippingCity",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Postal Code",
    fieldName: "ShippingPostalCode",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Location Code",
    fieldName: "Location_Code__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Location Status",
    fieldName: "Location_Status__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Active Location",
    fieldName: "Active_Location__c",
    hideDefaultActions: true,
    sortable: true
  }
];

const UPDATED_COLUMNS = [
  {
    label: "School Name",
    fieldName: "Name",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Location Code",
    fieldName: "Location_Code__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Location Status",
    fieldName: "Location_Status__c",
    hideDefaultActions: true,
    sortable: true
  },
  {
    label: "Active Location",
    fieldName: "Active_Location__c",
    hideDefaultActions: true,
    sortable: true
  }
];

export default class LocationCodeUpdater extends LightningElement {
  @track csvRecords = [];
  @track mapAccounts = {};
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
        Name: record?.lc_Name,
        ShippingPostalCode: record["Schools::ad_3Zip"],
        ShippingCity: record["Schools::ad_3City"],
        Location_Code__c: record?.Index_LocCode,
        Active_Location__c: record?.lc_ActiveCalc,
        Location_Status__c: record["Locations::lc_ActiveCalc"]
      };
      console.log("newRecord", newRecord);
      //add conditional to name
      if (newRecord.Name != null) {
        console.log("newRecord.Name", newRecord.Name);
        this.csvRecords.push(newRecord);
        this.mapAccounts[newRecord.Name] = newRecord;
      }
    });
    console.log("csvRecords", JSON.stringify(this.csvRecords));
    this.showCsvTable = true;
    this.showUpdatedTable = false;
    this.loading = false;
    console.log("ACABO");
  }

  handleUpdate() {
    this.loading = true;
    let schoolsNames = [];

    // this.csvRecords.forEach(record => {
    //     schoolsNames.push(record.Name);
    // }
    // );

    updateRecords({ csvAccountsMap: this.mapAccounts })
      .then((result) => {
        console.log("result", result);
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