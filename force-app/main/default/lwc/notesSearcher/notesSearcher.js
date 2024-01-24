import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import getNotes from '@salesforce/apex/notesSearcherController.getNotes';
import getPDFprint from '@salesforce/apex/notesSearcherController.getPrint';
import { loadScript } from 'lightning/platformResourceLoader';
import downloadjs from '@salesforce/resourceUrl/downloadjs';



export default class NotesSearcher extends LightningElement {
    @api recordId
    
    showCustomLookup = true;
    showSpinner;
    @track notesList;
    @track objectId;
    showDataTable = false;

    strFile;
    
    @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD] })
    account;

     get name() {
        return getFieldValue(this.account.data, NAME_FIELD);
    }

    renderedCallback() {
        loadScript(this, downloadjs);
    }

    connectedCallback() {
        if(this.recordId){
            this.showCustomLookup = false;
            this.objectId = this.recordId;
            getNotes({accountId: this.objectId})
            .then(result => {
                let notesList = [];  
                result.forEach(notes => {                            
                    notesList.push(notes);
                });
                this.notesList = [...notesList]; 

                this.showDataTable = true;
                console.log(JSON.stringify(this.notesList))
            })
            .catch(error => console.error(error))
            .finally(() => this.showSpinner = false);

        }
    }

    searchNotes(event){
        this.showSpinner = true;
        this.objectId = event.detail;
        getNotes({accountId: this.objectId})
        .then(result => {
            let notesList = [];  
            result.forEach(notes => {                            
                notesList.push(notes);
            });
            this.notesList = [...notesList]; 

            this.showDataTable = true;
            console.log(JSON.stringify(this.notesList))
        })
        .catch(error => console.error(error))
        .finally(() => this.showSpinner = false);
        
    }

    accountRemoved(event) {
        this.showDataTable = false;
    }

    // downloadPDF(event) {
    //     let baseUrl = window.location.origin;
    //     console.log(baseUrl);
    //     window.open(baseUrl + '/apex/notesTable?school=' + this.objectId, '_blank');
    // }

    downloadPDF(event) {
        getPDFprint({accountId: this.recordId}).then(response => {
            this.strFile = "data:application/pdf;base64,"+ response[0];
            window.open(response[1]);
        })
    }

    handleRemovePill() {
        this.showCustomLookup = true;
        this.showDataTable = false;
    }

}