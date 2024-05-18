import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript } from "lightning/platformResourceLoader";
import getUsers from "@salesforce/apex/CallExportMultipleUsersController.getUsers";
import getTasks from "@salesforce/apex/UserCallDetailController.getUserCallDetails";
import workbook from "@salesforce/resourceUrl/exportexcel";

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

export default class UserCallExportMultipleUsers extends LightningElement {
  startDate;
  endDate;
  options = [];
  selectedUserIds = [];
  dataToExport = [];
  loading = false;

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
    this.selectedUserIds = e.detail.value;
    this.dataToExport = [];
  }

  handleChangeStartValue(event) {
    this.startDate = event.target.value;
    this.dataToExport = [];
  }

  handleChangeEndValue(event) {
    this.endDate = event.target.value;
    this.dataToExport = [];
  }

  handleExportClick() {
    if (this.selectedUserIds.length === 0) {
      this.showToast("Please select users", "Error", "error");
      return;
    }
    this.loading = true;

    // want to iterate through the selectedUserIds and call the apex method for each user
    for (let i = 0; i < this.selectedUserIds.length; i++) {
      getTasks({
        userId: this.selectedUserIds[i],
        startDate: this.startDate,
        endDate: this.endDate
      })
        .then((data) => {
          const userData = {};
          let id = this.selectedUserIds[i];
          let name = this.options.find((option) => option.value === id).label;

          userData.Name = name.replace(/\s+/g, "");
          userData.SummaryData = this.getSummaryData(data);
          userData.Calls = this.prepareColumnsToCalls(data);
          userData.Emails = this.prepareColumnsToEmails(data);
          userData.Meetings = this.prepareColumnsToMeetings(data);
          userData.CallsPerEachMarket = this.getCallsPerEachMarket(data);
          userData.EmailsPerEachMarket = this.getEmailsPerEachMarket(data);
          userData.CallsPerEachTitle = this.getCallsPerEachTitle(data);
          userData.EmailPerEachTitle = this.getEmailsPerEachTitle(data);

          this.dataToExport.push(userData);
        })
        .catch((error) => {
          this.showToast(error.body.message, "Error", "error");
        })
        .finally(() => {
          if (i === this.selectedUserIds.length - 1) {
            this.exportToXLSX();
          }
          this.loading = false;
        });
    }
  }

  getSummaryData(data) {
    let callTotalAmount = data?.callDetailsDateRange.length;
    let emailTotalAmount = data?.emailDetailsDateRange.length;
    let callThisWeek = data?.callDetailsThisWeek.length;
    let callLastWeek = data?.callDetailsLastWeek.length;
    let callThisMonth = data?.callDetailsThisMonth.length;
    let callLastMonth = data?.callDetailsLastMonth.length;
    let emailThisWeek = data?.emailDetailsThisWeek.length;
    let emailLastWeek = data?.emailDetailsLastWeek.length;
    let emailThisMonth = data?.emailDetailsThisMonth.length;
    let emailLastMonth = data?.emailDetailsLastMonth.length;
    let meetingAmount = data?.meetingsDetailsDateRange.length;

    let callDetailsDateRange = data?.callDetailsDateRange;
    let meetingsDetailsDateRange = data?.meetingsDetailsDateRange;

    let numberOfDaysCalling = this.getNumberOfDaysCalling(callDetailsDateRange);
    let meetingsScheduledBySelf = this.getMeetingsScheduledBySelf(
      meetingsDetailsDateRange
    );
    let meetingsScheduledByOthers = this.getMeetingsScheduledByOthers(
      meetingsDetailsDateRange
    );

    let tmpObject = {
      "Call amount": callTotalAmount,
      "Email amount": emailTotalAmount,
      "Calls this week": callThisWeek,
      "Calls last week": callLastWeek,
      "Calls this month": callThisMonth,
      "Calls last month": callLastMonth,
      "Emails this week": emailThisWeek,
      "Emails last week": emailLastWeek,
      "Emails this month": emailThisMonth,
      "Emails last month": emailLastMonth,
      "Meetings amount": meetingAmount,
      "Scheduled meetings by self": meetingsScheduledBySelf,
      "Scheduled meetings by others": meetingsScheduledByOthers,
      "Number of days calling": numberOfDaysCalling
    };

    let summaryArray = Object.entries(tmpObject).map(([key, value]) => ({
      key,
      value
    }));

    return summaryArray;
  }

  getNumberOfDaysCalling(callDetailsDateRange) {
    if (callDetailsDateRange.length <= 0) {
      return 0;
    }
    let datesRaw = new Set();
    let datesWhileTraveling = new Set();

    for (let i = 0; i < callDetailsDateRange.length; i++) {
      let date = callDetailsDateRange[i].ActivityDate;

      if (callDetailsDateRange[i].Done_While_Traveling__c) {
        datesWhileTraveling.add(date);
      } else {
        datesRaw.add(date);
      }
    }
    // delete the dates that are in both sets
    for (let date of datesWhileTraveling) {
      datesRaw.delete(date);
    }

    return datesRaw.size;
  }

  getMeetingsScheduledBySelf(meetingsDetailsDateRange) {
    let meetingsScheduledBySelf = 0;
    for (let i = 0; i < meetingsDetailsDateRange.length; i++) {
      if (
        meetingsDetailsDateRange[i].CreatedById ===
        meetingsDetailsDateRange[i].OwnerId
      ) {
        meetingsScheduledBySelf += 1;
      }
    }
    return meetingsScheduledBySelf;
  }

  getMeetingsScheduledByOthers(meetingsDetailsDateRange) {
    let meetingsScheduledByOthers = 0;
    for (let i = 0; i < meetingsDetailsDateRange.length; i++) {
      if (
        meetingsDetailsDateRange[i].CreatedById !==
        meetingsDetailsDateRange[i].OwnerId
      ) {
        meetingsScheduledByOthers += 1;
      }
    }
    return meetingsScheduledByOthers;
  }

  prepareColumnsToCalls(data) {
    let callDetails = data?.callDetailsDateRange;
    for (let i = 0; i < callDetails.length; i++) {
      //want to know the type of variable callDetails[i].ActivityDate is

      let callId = callDetails[i].Id;
      let callUrl = "/" + callId;
      callDetails[i].CallUrl = callUrl;
      if (callDetails[i].OwnerId) {
        let ownerName = callDetails[i].Owner.Name;
        callDetails[i].OwnerName = ownerName;
      }
      if (callDetails[i].AccountId) {
        let accountName = callDetails[i].Account.Name;
        callDetails[i].AccountName = accountName;
      }
      if (callDetails[i].WhoId) {
        let contactName = callDetails[i].Who.Name;
        callDetails[i].ContactName = contactName;
      }
      if (callDetails[i].CreatedById) {
        let createdByName = callDetails[i].CreatedBy.Name;
        callDetails[i].CreatedByName = createdByName;
      }
      if (callDetails[i].Done_While_Traveling__c === true) {
        callDetails[i].Traveling = "Yes";
      } else {
        callDetails[i].Traveling = "No";
      }
      if (callDetails[i].Call_Result__c) {
        callDetails[i].Result = callDetails[i].Call_Result__c;
      }
      callDetails[i].DueDate = this.toStringDate(callDetails[i].ActivityDate);
    }
    return callDetails;
  }

  prepareColumnsToEmails(data) {
    let emailDetails = data?.emailDetailsDateRange;
    for (let i = 0; i < emailDetails.length; i++) {
      //want to know the type of variable emailDetails[i].ActivityDate is

      let callId = emailDetails[i].Id;
      let callUrl = "/" + callId;
      emailDetails[i].CallUrl = callUrl;
      if (emailDetails[i].OwnerId) {
        let ownerName = emailDetails[i].Owner.Name;
        emailDetails[i].OwnerName = ownerName;
      }
      if (emailDetails[i].AccountId) {
        let accountName = emailDetails[i].Account.Name;
        emailDetails[i].AccountName = accountName;
      }
      if (emailDetails[i].WhoId) {
        let contactName = emailDetails[i].Who.Name;
        emailDetails[i].ContactName = contactName;
      }
      if (emailDetails[i].CreatedById) {
        let createdByName = emailDetails[i].CreatedBy.Name;
        emailDetails[i].CreatedByName = createdByName;
      }
      if (emailDetails[i].Done_While_Traveling__c === true) {
        emailDetails[i].Traveling = "Yes";
      } else {
        emailDetails[i].Traveling = "No";
      }
      emailDetails[i].DueDate = this.toStringDate(emailDetails[i].ActivityDate);
    }
    return emailDetails;
  }

  prepareColumnsToMeetings(data) {
    let meetingsDetails = data?.meetingsDetailsDateRange;
    for (let i = 0; i < meetingsDetails.length; i++) {
      let meetingId = meetingsDetails[i].Id;
      let meetingUrl = "/" + meetingId;

      meetingsDetails[i].MeetingUrl = meetingUrl;
      if (meetingsDetails[i].OwnerId) {
        let ownerName = meetingsDetails[i].Owner.Name;
        meetingsDetails[i].OwnerName = ownerName;
      }
      if (meetingsDetails[i].AccountId) {
        let accountName = meetingsDetails[i].Account.Name;
        meetingsDetails[i].AccountName = accountName;
      }
      if (meetingsDetails[i].WhoId) {
        let contactName = meetingsDetails[i].Who.Name;
        meetingsDetails[i].ContactName = contactName;
      }
      if (meetingsDetails[i].CreatedById) {
        let createdByName = meetingsDetails[i].CreatedBy.Name;
        meetingsDetails[i].CreatedByName = createdByName;
      }
      meetingsDetails[i].DueDate = this.toStringDate(
        meetingsDetails[i].ActivityDate
      );
    }
    return meetingsDetails;
  }

  toStringDate(dateString) {
    // Create a Date object without converting to local time
    let date = new Date(dateString + "Z");
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();

    // Add leading zeros to month and day if necessary
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    return `${year}-${month}-${day}`;
  }

  getCallsPerEachMarket(data) {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the market is not in the map, add it and have a count of how many call are in each market
    //if the market is in the map, increment the count
    let contactCallOwners = data?.callContactsOwners;
    let callsPerEachMarket = {};
    for (let [key, value] of Object.entries(contactCallOwners)) {
      let market = value.Main_Market__c;
      if (market == undefined || market == null || market == "") {
        continue;
      }
      if (market in callsPerEachMarket) {
        callsPerEachMarket[market] += 1;
      } else {
        callsPerEachMarket[market] = 1;
      }
    }
    return callsPerEachMarket;
  }

  getEmailsPerEachMarket(data) {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the market is not in the map, add it and have a count of how many call are in each market
    //if the market is in the map, increment the count
    let contactEmailOwners = data?.emailContactsOwners;
    let emailsPerEachMarket = {};
    for (let [key, value] of Object.entries(contactEmailOwners)) {
      let market = value.Main_Market__c;
      if (market == undefined || market == null || market == "") {
        continue;
      }
      if (market in emailsPerEachMarket) {
        emailsPerEachMarket[market] += 1;
      } else {
        emailsPerEachMarket[market] = 1;
      }
    }
    return emailsPerEachMarket;
  }

  getCallsPerEachTitle(data) {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the title is not in the map, add it and have a count of how many call are in each title
    //if the title is in the map, increment the count
    let contactCallOwners = data?.callContactsOwners;
    let callsPerEachTitle = {};
    for (let [key, value] of Object.entries(contactCallOwners)) {
      let title = value.Title;
      if (title == undefined || title == null || title == "") {
        continue;
      }
      if (title in callsPerEachTitle) {
        callsPerEachTitle[title] += 1;
      } else {
        callsPerEachTitle[title] = 1;
      }
    }
    return callsPerEachTitle;
  }

  getEmailsPerEachTitle(data) {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the title is not in the map, add it and have a count of how many call are in each title
    //if the title is in the map, increment the count
    let contactEmailOwners = data?.emailContactsOwners;
    let callsPerEachTitle = {};
    for (let [key, value] of Object.entries(contactEmailOwners)) {
      let title = value.Title;
      if (title == undefined || title == null || title == "") {
        continue;
      }
      if (title in callsPerEachTitle) {
        callsPerEachTitle[title] += 1;
      } else {
        callsPerEachTitle[title] = 1;
      }
    }
    return callsPerEachTitle;
  }

  showToast(message, title, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  async exportToXLSX() {
    let _self = this;
    let allUsers = _self.dataToExport;
    for (let i = 0; i < allUsers.length; i++) {
      let user = allUsers[i];
      let _summary = this.deepCopyArray(user.SummaryData);
      let _callMarkets = this.convertObjectIntoArray(user.CallsPerEachMarket);
      let _emailMarkets = this.convertObjectIntoArray(user.EmailsPerEachMarket);
      let _callTitles = this.convertObjectIntoArray(user.CallsPerEachTitle);
      let _emailTitles = this.convertObjectIntoArray(user.EmailPerEachTitle);
      let _callsDetails = this.deepCopyArray(user.Calls);
      let _emailDetails = this.deepCopyArray(user.Emails);
      let _meetingsDetails = this.deepCopyArray(user.Meetings);

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
          fileName: `${user.Name}_Call_Detail.xlsx`,
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

  convertObjectIntoArray(object) {
    return Object.entries(object).map(([key, value]) => ({
      key,
      value
    }));
  }

  deepCopyArray(array) {
    return array.map((item) => ({ ...item }));
  }

  get thereAreSelectedUsers() {
    return this.selectedUserIds.length > 0;
  }

  get isDisabled() {
    return this.startDate || this.endDate ? false : true;
  }
}