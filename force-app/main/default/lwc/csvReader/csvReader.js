import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import PARSER from '@salesforce/resourceUrl/PapaParse';

// Upload the PapaParse library as static resource on your org (included in repository)

export default class CsvReader extends LightningElement {
    @api label;
    loading = false;
    columns = [];
    csvRecords = [];

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
                    this.csvRecords = results.data;
                    this.csvRecords.pop();
                    this.loading = false;
                    this.dispatchEvent(new CustomEvent('fileloaded', {detail: {records: this.csvRecords, columns: this.columns}}));
                },
                error: (error) => {
                    console.error(error);
                    this.loading = false;
                }
            })
        }
    }

    cleanData(){
        this.csvRecords = [];
        this.columns = [];
    }
}