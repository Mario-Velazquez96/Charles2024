import { LightningElement, track,wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import getRecords from '@salesforce/apex/AccountSearcherController.getContacts';
import PARSER from '@salesforce/resourceUrl/PapaParse';


export default class AccountSearcher extends LightningElement {

    parserInitialized = false;
    @track loading = false;
    schoolNames = [];
    //Array of field names used to create the csv file
    rowData =['AccountId','AccountName','Id','Title','Name','Email','Phone','SchoolAddress','City','State','ZipCode','MainMarket','SubMarket'];
    @track _results;
    @track _rows;
    @track contactRecords = [];
    showMessageError = false;

    get columns(){
        const columns = [
            { label: 'Contact Name', fieldName: 'ContactUrl', type: 'url',
                typeAttributes: {
                    label: { fieldName: 'Name' }, 
                    target: '_blank'
                },
            },
            { label: 'School Name', fieldName: 'AccountUrl', type: 'url',
                typeAttributes: {
                    label: { fieldName: 'AccountName' }, 
                    target: '_blank'
                },
            }, 
            { label: 'Email Address', fieldName: 'Email' },
            { label: 'Title', fieldName: 'Title' },
            { label: 'Main Market', fieldName: 'MainMarket' },
            { label: 'Sub Market', fieldName: 'SubMarket' },
            { label: 'Phone Number', fieldName: 'Phone' },
            { label: 'School Address', fieldName: 'SchoolAddress' },
            { label: 'City', fieldName: 'City' },
            { label: 'State', fieldName: 'State' },
            { label: 'Zip Code', fieldName: 'ZipCode' },
            
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
            this.schoolNames.push(row['Name']);
          })

        getRecords({accountsName : this.schoolNames})
        .then(result =>{
            this.contactRecords = result
            if(this.contactRecords.length === 0){
                this.showMessageError = true;
            } else {
                this.showMessageError = false;
            }
            this.loading = false;
        })
        .error(error =>{
            conlose.log(error);
            this.showMessageError = true;
            this.loading = false;
        })
    }

    cancel(){
        this._rows = undefined;
        this._results = undefined;
        this.contactRecords = [];
        this.schoolNames = [];
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
        for(let i=0; i < this.contactRecords.length; i++){
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
                    let value = this.contactRecords[i][rowKey] === undefined ? '' : this.contactRecords[i][rowKey];
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
        downloadElement.download = 'Contact Data.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click(); 
    }
}