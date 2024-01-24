import { LightningElement, api } from "lwc";

export default class MetricContainer extends LightningElement {
  @api label;
  @api value;
  @api description;
  @api labelFontSize;

  renderedCallback() {
    this.template
      .querySelector(".container")
      .style.setProperty("--label-font-size", this.labelFontSize);
  }
}