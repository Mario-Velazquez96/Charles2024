import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getTasks from "@salesforce/apex/UserCallDetailController.getUserCallDetails";

const TASKCOLUMNS = [
  {
    label: "Subject",
    fieldName: "CallUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "Subject" }, target: "_blank" }
  },
  {
    label: "Done While Traveling",
    fieldName: "Traveling",
    sortable: true
  },
  {
    label: "Due Date",
    fieldName: "DueDate",
    sortable: true
  },
  { label: "Owner", fieldName: "OwnerName", sortable: true },
  { label: "Account", fieldName: "AccountName", sortable: true },
  { label: "Contact", fieldName: "ContactName", sortable: true },
  { label: "Result", fieldName: "Result" },
  { label: "Priority", fieldName: "Priority" },
  { label: "Created By Name", fieldName: "CreatedByName" }
];

const EMAILCOLUMNS = [
  {
    label: "Subject",
    fieldName: "CallUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "Subject" }, target: "_blank" }
  },
  {
    label: "Due Date",
    fieldName: "DueDate",
    sortable: true
  },
  { label: "Owner", fieldName: "OwnerName", sortable: true },
  { label: "Account", fieldName: "AccountName", sortable: true },
  { label: "Contact", fieldName: "ContactName", sortable: true },
  { label: "Priority", fieldName: "Priority" },
  { label: "Created By Name", fieldName: "CreatedByName" }
];

const MEETINGCOLUMNS = [
  {
    label: "Subject",
    fieldName: "MeetingUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "Subject" }, target: "_blank" }
  },
  {
    label: "Due Date",
    fieldName: "DueDate",
    sortable: true
  },
  { label: "Owner", fieldName: "OwnerName", sortable: true },
  { label: "Account", fieldName: "AccountName", sortable: true },
  { label: "Contact", fieldName: "ContactName", sortable: true },
  { label: "Created By Name", fieldName: "CreatedByName" }
];

export default class UserCallDetailOverview extends LightningElement {
  taskColumns = TASKCOLUMNS;
  meetingColumns = MEETINGCOLUMNS;
  emailColumns = EMAILCOLUMNS;
  recordId;
  startDate;
  endDate;
  showSpinner;
  showSummary = false;
  loading = false;

  callDetailsThisWeek = [];
  callDetailsLastWeek = [];
  callDetailsThisMonth = [];
  callDetailsLastMonth = [];
  callDetailsDateRange = [];
  emailDetailsThisWeek = [];
  emailDetailsLastWeek = [];
  emailDetailsThisMonth = [];
  emailDetailsLastMonth = [];
  emailDetailsDateRange = [];
  meetingsDetailsDateRange = [];
  contactCallOwners = {};
  contactEmailOwners = {};

  callTotalAmount = 0;
  emailTotalAmount = 0;
  //conversationTotalAmount;
  numberOfDaysCalling = 0;
  callsPerEachMarket = {};
  emailsPerEachMarket = {};
  callsPerEachTitle = {};
  emailPerEachTitle = {};
  meetingsScheduledBySelf = 0;
  meetingsScheduledByOthers = 0;

  searchCalls(event) {
    this.loading = true;
    this.recordId = event.detail.selectedId;
    this.startDate = event.detail.startDate;
    this.endDate = event.detail.endDate;
    //let filters = event.detail.queryFilter;
    getTasks({
      userId: this.recordId,
      startDate: this.startDate,
      endDate: this.endDate
    })
      .then((data) => {
        this.callDetailsThisWeek = data?.callDetailsThisWeek;
        this.callDetailsLastWeek = data?.callDetailsLastWeek;
        this.callDetailsThisMonth = data?.callDetailsThisMonth;
        this.callDetailsLastMonth = data?.callDetailsLastMonth;
        this.callDetailsDateRange = data?.callDetailsDateRange;
        this.emailDetailsThisWeek = data?.emailDetailsThisWeek;
        this.emailDetailsLastWeek = data?.emailDetailsLastWeek;
        this.emailDetailsThisMonth = data?.emailDetailsThisMonth;
        this.emailDetailsLastMonth = data?.emailDetailsLastMonth;
        this.meetingsDetailsDateRange = data?.meetingsDetailsDateRange;
        this.emailDetailsDateRange = data?.emailDetailsDateRange;
        this.contactCallOwners = data?.callContactsOwners;
        this.contactEmailOwners = data?.emailContactsOwners;
        this.getSummaryData();
        this.prepareColumnsToCalls();
        this.prepareColumnsToEmails();
        this.prepareColumnsToMeetings();
        this.loading = false;
        this.showSummary = true;
        console.log("callDetailsDateRange", this.callDetailsDateRange);
      })
      .catch((error) => this.showToast("Error", error.body.message, "error"));
  }

  prepareColumnsToCalls() {
    let callDetails = this.callDetailsDateRange;
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
    this.callDetailsDateRange = callDetails;
  }

  prepareColumnsToEmails() {
    let emailDetails = this.emailDetailsDateRange;
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
    this.emailDetailsDateRange = emailDetails;
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

  prepareColumnsToMeetings() {
    let meetingsDetails = this.meetingsDetailsDateRange;
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
    this.meetingsDetailsDateRange = meetingsDetails;

    console.log(
      "meetingsDetailsDateRangeColumns prepare",
      this.meetingsDetailsDateRange
    );
  }

  getSummaryData() {
    this.callTotalAmount = this.callDetailsDateRange.length;
    this.emailTotalAmount = this.emailDetailsDateRange.length;
    this.numberOfDaysCalling = this.getNumberOfDaysCalling();
    this.callsPerEachMarket = this.getCallsPerEachMarket();
    this.emailsPerEachMarket = this.getEmailsPerEachMarket();
    this.callsPerEachTitle = this.getCallsPerEachTitle();
    this.emailPerEachTitle = this.getEmailsPerEachTitle();
    this.meetingsScheduledBySelf = this.getMeetingsScheduledBySelf();
    this.meetingsScheduledByOthers = this.getMeetingsScheduledByOthers();
  }

  //Get the number of days calling (not while traveling)
  getNumberOfDaysCalling() {
    if (this.callDetailsDateRange.length <= 0) {
      return 0;
    }
    let datesRaw = new Set();
    let datesWhileTraveling = new Set();

    for (let i = 0; i < this.callDetailsDateRange.length; i++) {
      let date = this.callDetailsDateRange[i].ActivityDate;

      if (this.callDetailsDateRange[i].Done_While_Traveling__c) {
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

  getCallsPerEachMarket() {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the market is not in the map, add it and have a count of how many call are in each market
    //if the market is in the map, increment the count
    let callsPerEachMarket = {};
    for (let [key, value] of Object.entries(this.contactCallOwners)) {
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

  getEmailsPerEachMarket() {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the market is not in the map, add it and have a count of how many call are in each market
    //if the market is in the map, increment the count
    let emailsPerEachMarket = {};
    for (let [key, value] of Object.entries(this.contactEmailOwners)) {
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

  getCallsPerEachTitle() {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the title is not in the map, add it and have a count of how many call are in each title
    //if the title is in the map, increment the count
    let callsPerEachTitle = {};
    for (let [key, value] of Object.entries(this.contactCallOwners)) {
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

  getEmailsPerEachTitle() {
    //iterate through the contactsTaskOwners which is a map of taskId and contacts
    //if the title is not in the map, add it and have a count of how many call are in each title
    //if the title is in the map, increment the count
    let callsPerEachTitle = {};
    for (let [key, value] of Object.entries(this.contactEmailOwners)) {
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

  getMeetingsScheduledBySelf() {
    let meetingsScheduledBySelf = 0;
    for (let i = 0; i < this.meetingsDetailsDateRange.length; i++) {
      if (
        this.meetingsDetailsDateRange[i].CreatedById ===
        this.meetingsDetailsDateRange[i].OwnerId
      ) {
        meetingsScheduledBySelf += 1;
      }
    }
    return meetingsScheduledBySelf;
  }

  getMeetingsScheduledByOthers() {
    let meetingsScheduledByOthers = 0;
    for (let i = 0; i < this.meetingsDetailsDateRange.length; i++) {
      if (
        this.meetingsDetailsDateRange[i].CreatedById !==
        this.meetingsDetailsDateRange[i].OwnerId
      ) {
        meetingsScheduledByOthers += 1;
      }
    }
    return meetingsScheduledByOthers;
  }

  cleanCalls() {
    this.loading = true;
    this.callDetailsThisWeek = [];
    this.callDetailsLastWeek = [];
    this.callDetailsThisMonth = [];
    this.callDetailsLastMonth = [];
    this.callDetailsDateRange = [];
    this.emailDetailsThisWeek = [];
    this.emailDetailsLastWeek = [];
    this.emailDetailsThisMonth = [];
    this.emailDetailsLastMonth = [];
    this.emailDetailsDateRange = [];
    this.meetingsDetailsDateRange = [];
    this.contactCallOwners = {};
    this.contactEmailOwners = {};
    this.callTotalAmount = 0;
    this.emailTotalAmount = 0;
    this.numberOfDaysCalling = 0;
    this.callsPerEachMarket = {};
    this.emailsPerEachMarket = {};
    this.callsPerEachTitle = {};
    this.emailPerEachTitle = {};
    this.meetingsScheduledBySelf = 0;
    this.meetingsScheduledByOthers = 0;
    this.loading = false;
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  isCallMarketDataLong() {
    return this.callMarketData.length > 18;
  }

  isEmailMarketDataLong() {
    return this.emailMarketData.length > 18;
  }

  isCallTitleDataLong() {
    return this.callTitleData.length > 18;
  }

  isEmailTitleDataLong() {
    return this.emailTitleData.length > 18;
  }

  get callDetailThisWeekSize() {
    return this.callDetailsThisWeek.length;
  }

  get callDetailsLastWeekSize() {
    return this.callDetailsLastWeek.length;
  }

  get callDetailsThisMonthSize() {
    return this.callDetailsThisMonth.length;
  }

  get callDetailsLastMonthSize() {
    return this.callDetailsLastMonth.length;
  }

  get emailDetailThisWeekSize() {
    return this.emailDetailsThisWeek.length;
  }

  get emailDetailsLastWeekSize() {
    return this.emailDetailsLastWeek.length;
  }

  get emailDetailsThisMonthSize() {
    return this.emailDetailsThisMonth.length;
  }

  get emailDetailsLastMonthSize() {
    return this.emailDetailsLastMonth.length;
  }

  get meetingsDetailsDateRangeSize() {
    return this.meetingsDetailsDateRange.length;
  }

  get isThereCallMarkets() {
    return Object.keys(this.callsPerEachMarket).length > 0;
  }

  get isThereNoCallMarkets() {
    return Object.keys(this.callsPerEachMarket).length <= 0;
  }

  get callMarketData() {
    return Object.entries(this.callsPerEachMarket).map(([key, value]) => ({
      key,
      value
    }));
  }

  get isThereEmailMarkets() {
    return Object.keys(this.emailsPerEachMarket).length > 0;
  }

  get isThereNoEmailMarkets() {
    return Object.keys(this.emailsPerEachMarket).length <= 0;
  }

  get emailMarketData() {
    return Object.entries(this.emailsPerEachMarket).map(([key, value]) => ({
      key,
      value
    }));
  }

  get isThereCallTitles() {
    return Object.keys(this.callsPerEachTitle).length > 0;
  }

  get isThereNoCallTitles() {
    return Object.keys(this.callsPerEachTitle).length <= 0;
  }

  get callTitleData() {
    return Object.entries(this.callsPerEachTitle).map(([key, value]) => ({
      key,
      value
    }));
  }

  get isThereEmailTitles() {
    return Object.keys(this.emailPerEachTitle).length > 0;
  }

  get isThereNoEmailTitles() {
    return Object.keys(this.emailPerEachTitle).length <= 0;
  }

  get emailTitleData() {
    return Object.entries(this.emailPerEachTitle).map(([key, value]) => ({
      key,
      value
    }));
  }

  get isThereMeetings() {
    return this.meetingsDetailsDateRange.length > 0;
  }

  get isThereNoMeetings() {
    return this.meetingsDetailsDateRange.length <= 0;
  }

  get isThereCalls() {
    return this.callDetailsDateRange.length > 0;
  }

  get isThereNoCalls() {
    return this.callDetailsDateRange.length <= 0;
  }

  get isThereEmails() {
    return this.emailDetailsDateRange.length > 0;
  }

  get isThereNoEmails() {
    return this.emailDetailsDateRange.length <= 0;
  }

  get layoutCallMarketClass() {
    return `slds-p-horizontal_small  ${
      this.isCallMarketDataLong() ? "limited-height" : ""
    }`;
  }

  get layoutEmailMarketClass() {
    return `slds-p-horizontal_small  ${
      this.isEmailMarketDataLong() ? "limited-height" : ""
    }`;
  }

  get layoutCallTitleClass() {
    return `slds-p-left_small slds-p-right_x-small ${
      this.isCallTitleDataLong() ? "limited-height" : ""
    }`;
  }

  get layoutEmailTitleClass() {
    return `slds-p-right_small slds-p-left_x-small  ${
      this.isEmailTitleDataLong() ? "limited-height" : ""
    }`;
  }

  get layoutCallClass() {
    return `${this.callDetailsDateRange.length > 12 ? "limited-height" : ""}`;
  }

  get layoutEmailClass() {
    return `${this.emailDetailsDateRange.length > 12 ? "limited-height" : ""}`;
  }

  get layoutMeetingClass() {
    return `${
      this.meetingsDetailsDateRange.length > 12 ? "limited-height" : ""
    }`;
  }
}