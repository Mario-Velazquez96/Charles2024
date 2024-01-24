import { LightningElement } from "lwc";
import getTestimonials from "@salesforce/apex/TestimonialTableController.getTestimonials";
import getFilterTestimonials from "@salesforce/apex/TestimonialTableController.getFilterTestimonials";

const COLUMNS = [
  {
    label: "Name",
    fieldName: "recordLink",
    type: "url",
    typeAttributes: {
      label: { fieldName: "Name" },
      target: "_blank"
    },
    initialWidth: 400
  },
  {
    label: "Testimonial",
    fieldName: "TestimonialText",
    type: "richText",
    wrapText: true
  },
  {
    label: "Testimonial Date",
    fieldName: "TestimonialDate",
    type: "date",
    initialWidth: 200
  }
];

export default class TestimonialTable extends LightningElement {
  testimonials = [];

  columns = COLUMNS;

  pageNumber = 0;
  pageData;

  startDate;
  endDate;

  isLoading;

  async connectedCallback() {
    this.isLoading = true;
    let temp = await getTestimonials();
    this.testimonials = temp.map((record) => ({
      ...record,
      TestimonialText: this.stripHtmlTags(record.TestimonialText)
    }));
    this.updatePage();
  }

  stripHtmlTags(str) {
    if (str) {
      // Removes all HTML tags and converts HTML entities to their corresponding characters
      return str.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, (match) => {
        const entity = document.createElement("textarea");
        entity.innerHTML = match;
        return entity.value;
      });
    }
    return str;
  }

  previous() {
    this.pageNumber = Math.max(0, this.pageNumber - 1);
    this.updatePage();
  }

  first() {
    this.pageNumber = 0;
    this.updatePage();
  }

  next() {
    this.pageNumber = Math.min(
      Math.ceil(this.testimonials.length / 10),
      this.pageNumber + 1
    );
    this.updatePage();
  }

  last() {
    this.pageNumber = Math.ceil(this.testimonials.length / 10) - 1;
    this.updatePage();
  }

  updatePage() {
    this.isLoading = true;
    this.pageData = this.testimonials.slice(
      this.pageNumber * 10,
      this.pageNumber * 10 + 10
    );
    this.isLoading = false;
  }

  handleDateChange(event) {
    const fieldName = event.target.name;
    if (fieldName === "startDate") {
      this.startDate = event.target.value;
    } else if (fieldName === "endDate") {
      this.endDate = event.target.value;
    }
  }

  handleFilter() {
    getFilterTestimonials({ startDate: this.startDate, endDate: this.endDate })
      .then((result) => {
        this.isLoading = true;
        this.refreshSettings();
        this.testimonials = result.map((record) => ({
          ...record,
          TestimonialText: this.stripHtmlTags(record.TestimonialText)
        }));
        this.updatePage();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async handleRefresh() {
    this.isLoading = true;
    this.startDate = null;
    this.endDate = null;
    this.refreshSettings();
    let temp = await getTestimonials();
    this.testimonials = temp.map((record) => ({
      ...record,
      TestimonialText: this.stripHtmlTags(record.TestimonialText)
    }));
    this.updatePage();
  }

  refreshSettings() {
    this.testimonials = [];
    this.pageData = [];
    this.pageNumber = 0;
  }

  downloadCSVFile() {
    const rowEnd = "\n";
    const rowColumns = ["Name", "TestimonialText"];
    let csvString = "\ufeff";

    csvString += rowColumns.join(",") + rowEnd;

    // Rows
    this.testimonials.forEach((testimonial) => {
      const row = rowColumns.map((columnName) => {
        let value = testimonial[columnName]
          ? String(testimonial[columnName])
          : "";
        // Handle special characters (e.g., quotes in your data)
        value = value.replace(/"/g, '""'); // Escape double quotes
        return `"${value}"`; // Quote each value
      });
      csvString += row.join(",") + rowEnd;
    });

    // Creating anchor element to download
    const downloadElement = document.createElement("a");
    downloadElement.href =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    downloadElement.target = "_self";
    downloadElement.download = "Testimonials.csv";

    // Click to download
    downloadElement.click();
  }

  get emptyTestimonials() {
    return this.testimonials.length > 0;
  }

  get disabledFirst() {
    return this.pageNumber === 0;
  }

  get disabledNext() {
    return this.pageNumber + 1 === Math.ceil(this.testimonials.length / 10);
  }

  get disabledLast() {
    return this.pageNumber + 1 === Math.ceil(this.testimonials.length / 10);
  }

  get disabledPrevious() {
    return this.pageNumber === 0;
  }

  get totalRecords() {
    return this.testimonials.length;
  }

  get totalPages() {
    return Math.ceil(this.testimonials.length / 10);
  }

  get page() {
    return this.pageNumber + 1;
  }
}