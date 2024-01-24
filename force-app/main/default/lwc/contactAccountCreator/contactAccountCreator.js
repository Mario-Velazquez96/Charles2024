import { LightningElement, track,wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import getRecords from '@salesforce/apex/ContactAccountCreatorController.getContactNotCreated';
import createRecords from '@salesforce/apex/ContactAccountCreatorController.createRecords';
import PARSER from '@salesforce/resourceUrl/PapaParse';

const RECORDS_COLUMS = [
    { label: 'Name', fieldName: 'Url', type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' }, 
                target: '_blank'
            },     
    },
    { label: 'Object Type', fieldName: 'ObjectType' },
];

export default class ContactAccountCreator extends LightningElement {
    parserInitialized = false;
    @track loading = false;
    contactEmails = [];
    emailsToCreate;
    messageError;
    @track contactsToCreate = [];
    //Array of field names used to create the csv file
    rowData =['Name','ObjectType','Id'];
    @track _rows;
    @track contactRecords = [];
    showMessageError = false;
    @track columns = [];
    @track recordsCreated = [];
    recordsCreatedColumns = RECORDS_COLUMS;
    
    // get columns(){
    //     const columns = [
    //         { label: 'Contact Name', fieldName: 'ContactUrl', type: 'url',
    //             typeAttributes: {
    //                 label: { fieldName: 'Name' }, 
    //                 target: '_blank'
    //             },
    //         },
    //         { label: 'School Name', fieldName: 'AccountUrl', type: 'url',
    //             typeAttributes: {
    //                 label: { fieldName: 'AccountName' }, 
    //                 target: '_blank'
    //             },
    //         }, 
    //         { label: 'Email Address', fieldName: 'Email' },
    //         { label: 'Title', fieldName: 'Title' },
    //         { label: 'Main Market', fieldName: 'MainMarket' },
    //         { label: 'Sub Market', fieldName: 'SubMarket' },
    //         { label: 'Phone Number', fieldName: 'Phone' },
    //         { label: 'School Address', fieldName: 'SchoolAddress' },
    //         { label: 'City', fieldName: 'City' },
    //         { label: 'State', fieldName: 'State' },
    //         { label: 'Zip Code', fieldName: 'ZipCode' },
            
    //     ];

    //     return columns;
    // }

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
        this.cleanData();
        if(event.target.files.length > 0){
            const file = event.target.files[0];
            this.loading = true;
            Papa.parse(file, {
                quoteChar: '"',
                header: 'true',
                complete: (results) => {
                    results.meta.fields.forEach(field => {
                        //create an object with the field name and the field value
                        const column = {};
                        column['label'] = field;
                        column['fieldName'] = field;
                        //add the object to the array
                        this.columns.push(column);
                        
                    });
                    this._rows = results.data;
                    this.getContacts();
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
            this.contactEmails.push(row['Email']);
          })

        getRecords({contactEmails : this.contactEmails})
        .then(result =>{
            this.emailsToCreate = result
            this._rows.forEach(row => {
                this.emailsToCreate.forEach(email => {
                    if(row['Email'] === email){
                        this.contactsToCreate.push(row);
                    }
                })
            })
            if(this.contactsToCreate.length === 0){
                this.messageError = 'No contacts to create';
                this.showMessageError = true;
            } else {
                this.showMessageError = false;
            }
            this.loading = false;
        })
        .error(error =>{
            this.contactsToCreate = [];
            messageError = 'Error getting records';
            this.showMessageError = true;
            this.loading = false;
        })
    }

    cancel(){
        this.cleanData();
    }

    cleanData(){
        this._rows = undefined;
        this.contactEmails = [];
        this.emailsToCreate = [];
        this.contactsToCreate = [];
        this.columns = [];
        this.showMessageError = false;
        this.recordsCreated = [];
    }

    create(){
        this.loading = true;
        createRecords({jsonString : JSON.stringify(this.contactsToCreate)})
        .then(result =>{
            this.cleanData();
            this.recordsCreated = result;
            this.loading = false;
        })
        .catch(error =>{
            console.log('Error creating records',error);
            this.showMessageError = true;
            this.messageError = 'Error creating records';
            this.loading = false;
        })
    }

    exportContactData(){
        this.downloadCSVFile()
    }

    downloadCSVFile() {   
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
        csvString += this.rowData.join(',');
        csvString += rowEnd;
        // main for loop to get the data based on key value
        for(let i=0; i < this.recordsCreated.length; i++){
            let colValue = 0;

            // validating keys in data
            for(let key in this.rowData) {
                if(this.rowData.hasOwnProperty(key)) {
                    // Key value 
                    // Ex: Id, Name
                    let rowKey = this.rowData[key];
                    // add , after every value except the first.
                    if(colValue > 0){
                        csvString += ',';
                    }
                    // If the column is undefined, it as blank in the CSV file.
                    let value = this.recordsCreated[i][rowKey] === undefined ? '' : this.recordsCreated[i][rowKey];
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
        downloadElement.download = 'Records Created Data.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click(); 
    }
}