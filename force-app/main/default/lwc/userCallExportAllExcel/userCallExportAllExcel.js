import { LightningElement, api } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/exportexcel";
import getTasks from "@salesforce/apex/UserCallExportAllData.getUsersCallDetails";

const summaryColumns = [
  {
    column: "Summary",
    type: String,
    value: (d) => d.key,
    width: 20
  },
  {
    column: "Amount",
    type: Number,
    value: (d) => d.value
  }
];

const marketColumns = [
  {
    column: "Market",
    type: String,
    value: (d) => d.key,
    width: 20
  },
  {
    column: "Amount",
    type: Number,
    value: (d) => d.value
  }
];

const titleColumns = [
  {
    column: "Title",
    type: String,
    value: (d) => d.key,
    width: 30
  },
  {
    column: "Amount",
    type: Number,
    value: (d) => d.value
  }
];

const callDetailColumns = [
  {
    column: "Subject",
    type: String,
    value: (d) => d.Subject,
    width: 30
  },
  {
    column: "Done While Traveling",
    type: String,
    value: (d) => d.Traveling
  },
  {
    column: "Due Date",
    type: String,
    value: (d) => d.DueDate,
    width: 12
  },
  {
    column: "Owner",
    type: String,
    value: (d) => d.OwnerName,
    width: 15
  },
  {
    column: "Account",
    type: String,
    value: (d) => d.AccountName,
    width: 30
  },
  {
    column: "Contact",
    type: String,
    value: (d) => d.ContactName,
    width: 30
  },
  {
    column: "Result",
    type: String,
    value: (d) => d.Result,
    width: 15
  },
  {
    column: "Priority",
    type: String,
    value: (d) => d.Priority
  },
  {
    column: "Created By Name",
    type: String,
    value: (d) => d.CreatedByName,
    width: 15
  }
];

const emailDetailColumns = [
  {
    column: "Subject",
    type: String,
    value: (d) => d.Subject,
    width: 20
  },
  {
    column: "Due Date",
    type: String,
    value: (d) => d.DueDate,
    width: 12
  },
  {
    column: "Owner",
    type: String,
    value: (d) => d.OwnerName,
    width: 15
  },
  {
    column: "Account",
    type: String,
    value: (d) => d.AccountName,
    width: 30
  },
  {
    column: "Contact",
    type: String,
    value: (d) => d.ContactName,
    width: 30
  },
  {
    column: "Priority",
    type: String,
    value: (d) => d.Priority
  },
  {
    column: "Created By Name",
    type: String,
    value: (d) => d.CreatedByName,
    width: 15
  }
];

const meetingDetailColumns = [
  {
    column: "Subject",
    type: String,
    value: (d) => d.Subject,
    width: 20
  },
  {
    column: "Due Date",
    type: String,
    value: (d) => d.DueDate,
    width: 12
  },
  {
    column: "Owner",
    type: String,
    value: (d) => d.OwnerName,
    width: 15
  },
  {
    column: "Account",
    type: String,
    value: (d) => d.AccountName,
    width: 30
  },
  {
    column: "Contact",
    type: String,
    value: (d) => d.ContactName,
    width: 30
  },
  {
    column: "Created By Name",
    type: String,
    value: (d) => d.CreatedByName,
    width: 15
  }
];

export default class UserCallExportAllExcel extends LightningElement {
  @api summary;
  @api callMarkets;
  @api emailMarkets;
  @api callTitles;
  @api emailTitles;
  @api callsDetails;
  @api emailDetails;
  @api meetingsDetails;

  @api startDate;
  @api endDate;

  isLibraryLoaded = false;

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

  // Function to deep copy an array of objects
  deepCopyArray(array) {
    return array.map((item) => ({ ...item }));
  }

  exportData() {
    getTasks({ startDate: this.startDate, endDate: this.endDate })
      .then((result) => {
        console.log("result", result);
        this.summary = result.summary;
        this.callMarkets = result.callMarkets;
        this.emailMarkets = result.emailMarkets;
        this.callTitles = result.callTitles;
        this.emailTitles = result.emailTitles;
        this.callsDetails = result.callsDetails;
        this.emailDetails = result.emailDetails;
        this.meetingsDetails = result.meetingsDetails;
        this.exportToXLSX();
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  // calling the download function from xlsxMain.js
  async exportToXLSX() {
    let _self = this;
    console.log("test");
    let _summary = this.deepCopyArray(_self.summary);
    console.log("summary", _summary);
    let _callMarkets = this.deepCopyArray(_self.callMarkets);
    let _emailMarkets = this.deepCopyArray(_self.emailMarkets);
    let _callTitles = this.deepCopyArray(_self.callTitles);
    let _emailTitles = this.deepCopyArray(_self.emailTitles);
    let _callsDetails = this.deepCopyArray(_self.callsDetails);
    let _emailDetails = this.deepCopyArray(_self.emailDetails);
    let _meetingsDetails = this.deepCopyArray(_self.meetingsDetails);

    await writeXlsxFile(
      [
        _summary,
        _callMarkets,
        _emailMarkets,
        _callTitles,
        _emailTitles,
        _callsDetails,
        _emailDetails,
        _meetingsDetails
      ],
      {
        schema: [
          summaryColumns,
          marketColumns,
          marketColumns,
          titleColumns,
          titleColumns,
          callDetailColumns,
          emailDetailColumns,
          meetingDetailColumns
        ],
        fileName: "User_Call_Detail.xlsx",
        sheets: [
          "Summary",
          "Call Markets",
          "Email Markets",
          "Call Titles",
          "Email Titles",
          "Call Details",
          "Email Details",
          "Meeting Details"
        ],
        headerStyle: {
          backgroundColor: "#305496",
          fontWeight: "bold",
          align: "center",
          color: "#FFFFFF"
        }
      }
    );
  }
}
