import { LightningElement, api } from 'lwc';

export default class FocusTrap extends LightningElement {
    @api trapFocus;

    onFocus(event) {
      this.trapFocus(event);
    }
}