import { LightningElement, wire } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import getAccounts from "@salesforce/apex/testControllerExcell.getAccounts";
import getUsers from "@salesforce/apex/testControllerExcell.getUsers";
import workbook from "@salesforce/resourceUrl/exportexcel";

export default class TestExcel extends LightningElement {
  isLibraryLoaded = false;
  columnHeader = ["ID", "Name", "Shipping City", "Shipping State"];
  records = [];
  options = [];
  selected = [];

  connectedCallback() {
    getUsers().then((data) => {
      for (let i = 0; i < data.length; i++) {
        this.options = [
          ...this.options,
          { label: data[i].Name, value: data[i].Id }
        ];
      }
    });
  }

  handleChange(e) {
    this.selected = e.detail.value;
    console.log("selected", this.selected);
    console.log("options", JSON.stringify(this.selected));
  }

  @wire(getAccounts)
  wiredData({ error, data }) {
    if (data) {
      this.records = data;
      console.log("records", this.records);
    } else if (error) {
      console.error("Error:", error);
    }
  }
  renderedCallback() {
    if (this.isLibraryLoaded) return;
    this.isLibraryLoaded = true;
    loadScript(this, workbook)
      .then(async (data) => {
        console.log("success------>>>", data);
      })
      .catch((error) => {
        console.log("failure-------->>>>", error);
      });
  }
  // calling the download function from xlsxMain.js
  async exportToXLSX() {
    let _self = this;
    var columns = [
      {
        column: "Id",
        type: String,
        value: (d) => d.Id
      },
      {
        column: "Account Name",
        type: String,
        value: (d) => d.Name,
        width: 30
      }
    ];

    var columns2 = [
      {
        column: "Account Name",
        type: String,
        value: (d) => d.Name,
        width: 30
      }
    ];
    console.log("testset", _self.records);
    await writeXlsxFile([_self.records, _self.records], {
      schema: [columns, columns2],
      sheets: ["Sheet 1", "Sheet 2"],
      fileName: "file.xlsx",
      headerStyle: {
        backgroundColor: "#1E2F97",
        fontWeight: "bold",
        align: "center",
        color: "#FFFFFF"
      }
    });
  }
}