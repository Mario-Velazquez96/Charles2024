import { LightningElement,track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import createRecords from '@salesforce/apex/ContactSearcherController.createRecords';
import getRecords from '@salesforce/apex/ContactSearcherController.getContacts';
import PARSER from '@salesforce/resourceUrl/PapaParse';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class ContactSearcher extends LightningElement {
    parserInitialized = false;
    @track loading = false;
    isCreateCode = false;
    contactIds = [];
    contactsEmails = [];
    @track codeName;
    @track _results;
    @track _rows;
    @track contactRecords = [];
    showMessageError = false;
    csvColumns = [];
    
    get columns(){
        const columns = [
            { label: 'Contact Name', fieldName: 'ContactUrl', type: 'url',
                typeAttributes: {
                    label: { fieldName: 'Name' }, 
                    target: '_blank'
                },
            },
            { label: 'Email Address', fieldName: 'Email' },
            { label: 'Account Name', fieldName: 'AccountUrl', type: 'url',
                typeAttributes: {
                    label: { fieldName: 'AccountName' }, 
                    target: '_blank'
                },
            },  
        ];

        if(this.results.length){
            columns.push({ label: 'Result',fieldName: 'result' });
        }

        return columns;
    }

    get results(){
        if(this._results){
            return this._results.map(r => {
                const result = {};
                result.success = r.status === 'fulfilled';
                result.id = result.success ? r.value.id : undefined;
                result.error = !result.success ? r.reason.body.message : undefined;
                return result;
            });
        }

        return [];
    }

    renderedCallback() {
        if(!this.parserInitialized){
            loadScript(this, PARSER)
                .then(() => {
                    this.parserInitialized = true;
                })
                .catch(error => console.error(error));
        }
    }

    handleInputChange(event){
        if(event.target.files.length > 0){
            const file = event.target.files[0];
            this.loading = true;
            Papa.parse(file, {
                quoteChar: '"',
                header: 'true',
                complete: (results) => {
                    results.meta.fields.forEach(field => {
                        this.csvColumns.push(field);
                    });
                    this._rows = results.data;
                    this.getContacts();
                    //this.loading = false;
                },
                error: (error) => {
                    console.error(error);
                    this.loading = false;
                }
            })
        }
    }

    getContacts(){
        this._rows.forEach(row => {
            this.contactsEmails.push(row['Email Address']);
          })

        getRecords({contactsEmail : this.contactsEmails})
        .then(result =>{
            this.contactRecords = result
            if(this.contactRecords.length === 0){
                this.showMessageError = true;
            } else {
                this.showMessageError = false;
            }
            this.loading = false;

            // delete rows that are in the result
            this._rows = this._rows.filter(row => {
                return !this.contactRecords.find(record => record.Email === row['Email Address']);
            }
            );
            console.log('rows',JSON.stringify(this._rows));
        })
        .error(error =>{
            conlose.log(error);
            this.showMessageError = true;
            this.loading = false;
        })
        .finally(()=>{
            if(this.contactRecords.length === 0){
                this.showMessageError = true;
            }
        })
    }

    openCodeModal(){
        this.isCreateCode = true;
    }

    createMarketingCode(){
        this.loading = true;
        this.isCreateCode = false;
        this.contactRecords.forEach(row => {
            this.contactIds.push(row.Id);
          })
        // for (let index = 0; index < this._rows.length; index++) {
        //     this.contactIds.push(this._rows[index].['Email Address']);    
        // }
        console.log('records',JSON.stringify(this.contactIds));

        createRecords({contactsId : this.contactIds, codeName : this.codeName})
        .then(result => {
            this.loading = false;
            this._rows = undefined;
            this._results = undefined;
            this.contactRecords = [];
            this.contactIds = [];
            this.dispatchEvent(
                new ShowToastEvent( {
                    title: 'Success',
                    message: result,
                    variant: result.includes("success") ? 'success' : 'error',
                    mode: 'sticky'
                } ),
            );
        })
        .catch(error => {
            this._rows = undefined;
            this._results = undefined;
            this.loading = false;
            this.dispatchEvent(
                new ShowToastEvent( {
                    title: 'Error!!',
                    message: JSON.stringify(error),
                    variant: 'error',
                    mode: 'sticky'
                } ),
            );
        })
        .finally(() => {
        })
    }

    cancel(){
        this._rows = undefined;
        this._results = undefined;
        this.contactRecords = [];
        this.contactIds = [];
    }

    hideCodeModal() {  
        this.isCreateCode = false;
    }

    handleChange(event) {
        this.codeName = event.target.value
    }    

    exportContactData(){
        let rowEnd = '\n';
        let csvString = '';
        // this set elminates the duplicates if have any duplicate keys
        //let rowData = new Set();

        // getting keys from data
        /*this.contactRecords.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                if(key !== 'ContactUrl' && key !== 'AccountUrl'){
                    rowData.add(key);
                }
            });
        });*/

        // Array.from() method returns an Array object from any object with a length property or an iterable object.
        //rowData = Array.from(rowData);
        
        // splitting using ','
        csvString += this.csvColumns.join(',');
        csvString += rowEnd;
        // main for loop to get the data based on key value
        for(let i=0; i < this._rows.length; i++){
            let colValue = 0;

            // validating keys in data
            for(let key in this.csvColumns) {
                if(this.csvColumns.hasOwnProperty(key)) {
                    // Key value 
                    // Ex: Id, Name
                    let rowKey = this.csvColumns[key];
                    // add , after every value except the first.
                    if(colValue > 0){
                        csvString += ',';
                    }
                    // If the column is undefined, it as blank in the CSV file.
                    let value = this._rows[i][rowKey] === undefined ? '' : this._rows[i][rowKey];
                    csvString += '"'+ value +'"';
                    colValue++;
                }
            }
            csvString += rowEnd;
        }

        // Creating anchor element to download
        let downloadElement = document.createElement('a');
        // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
        downloadElement.target = '_self';
        // CSV File Name
        downloadElement.download = 'Contacts Not In Database.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click(); 
    }
}