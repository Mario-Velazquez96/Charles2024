import { api, LightningElement, track, wire } from 'lwc';
import lookUp from '@salesforce/apex/notesSearcherLookupController.search';

export default class NotesSearcherLookup extends LightningElement {
    @api objName;
    @api iconName;
    @api filter = '';
    @api searchPlaceholder='Search';
    @track selectedName;
    @track selectedId;
    @track records;
    @track isValueSelected;
    @track blurTimeout;
    searchTerm;
    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';
    @wire(lookUp, {searchTerm : '$searchTerm', myObject : '$objName', filter : '$filter'})
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
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
    }

    onSelect(event) {
        let selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
        this.isValueSelected = true;
        this.selectedId = selectedId;
        this.selectedName = selectedName;
        if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleRemovePill() {
        this.isValueSelected = false;
        this.dispatchEvent(new CustomEvent('removeaccount', {
            detail: this.selectedId,
            bubbles: true,
            composed: true
        }));
    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }

    handleSearchClick() {
        console.log('test', this.selectedId);
        this.dispatchEvent(new CustomEvent('accountsearch', {
            detail: this.selectedId,
            bubbles: true,
            composed: true
        }));
    }
}