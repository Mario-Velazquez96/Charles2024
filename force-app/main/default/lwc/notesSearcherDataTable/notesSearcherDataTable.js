import { LightningElement, api, wire, track } from 'lwc';

const COLUMNS = [
    { label: 'Title', fieldName: 'title', type: 'text', wrapText: true },
    { label: 'Body', fieldName: 'body', type: 'text', wrapText: true },
    { label: 'Owner', fieldName: 'ownerName', type: 'text', sortable: true },
    { label: 'Created Date', fieldName: 'createdDateFormatted', sortable: true, sortFieldName: 'createdDate' },
    { label: 'Type', fieldName: 'objectType', type: 'text' },
    { label: 'Created By', fieldName: 'userName', type: 'text' },
];

const SORT_FIELD_MAP = {
    createdDateFormatted: 'createdDate',
};

export default class NotesSearcherDataTable extends LightningElement {
    disabledFirst = false;
    disabledPrevious = false;
    disabledNext = false;
    disabledLast = false;
    totalRecords;
    page;
    totalPages;
    columns = COLUMNS;
    sortedBy = 'ownerName';
    sortDirection;
    defaultSortDirection = 'asc';
    allSelectedRows = new Set()
    pageNumber = 0
    pageData = []
    _notesList = [];
     

    updatePage() {
        this.pageData = this.notesList.slice(this.pageNumber*5, this.pageNumber*5+5);
        this.totalRecords = this.notesList.length;
        this.totalPages = Math.ceil((this.notesList.length)/5);
        this.page = this.pageNumber+1;
        console.log('pageData', this.pageData);
        this.disableButtons();
    }

    previous() {
        this.pageNumber = Math.max(0, this.pageNumber - 1);
        this.updatePage()
    }

    first() {
        this.pageNumber = 0;
        this.updatePage();
    }

    next() {
        this.pageNumber = Math.min(Math.ceil((this.notesList.length)/5), this.pageNumber + 1);
        this.updatePage();
    }

    last() {
        this.pageNumber = Math.ceil((this.notesList.length)/5)-1;
        this.updatePage();
    }

    disableButtons(){
        if(this.pageNumber == 0){
            this.disabledFirst = true;
            this.disabledPrevious = true;
        }
        else{
            this.disabledFirst = false;
            this.disabledPrevious = false;
        }
        if(this.pageNumber + 1 == Math.ceil((this.notesList.length)/5)){
            this.disabledNext = true;
            this.disabledLast = true;
        }
        else{
            this.disabledNext = false;
            this.disabledLast = false;
        }
    }

    onHandleSort(event) {
        var fieldName = event.detail.fieldName;
        var sortedDirection = event.detail.sortDirection;
        this.sortedBy = fieldName;
        this.sortDirection = sortedDirection;
        this.sortData(fieldName, sortedDirection);
        this.updatePage();
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this._notesList));
        let isReverse = direction === 'asc' ? 1: -1;
    
        const sortField = SORT_FIELD_MAP[fieldname] || fieldname;
    
        parseData.sort((x, y) => {
            let a = x[sortField];
            let b = y[sortField];
    
            if (sortField === 'createdDate' && a && b) {
                // Convert 'YYYY-MM-DD' to a Date object
                a = new Date(a);
                b = new Date(b);
            }
    
            // Convert dates to timestamps for comparison
            a = a instanceof Date ? a.getTime() : a;
            b = b instanceof Date ? b.getTime() : b;
    
            return isReverse * ((a > b) - (b > a));
        });
    
        this._notesList = parseData;
    }   

    download(){
        this.dispatchEvent(new CustomEvent('download'));
    }

    @api
    set notesList(data) {
        if (data) {
            this._notesList = data.map(note => {
                const noteClone = { ...note }; // create a copy of the note object
                
                noteClone.createdDateFormatted = this.formatDate(note.createdDate); // format the 'createdDate'
                return noteClone;
            });
            this.updatePage();
        }
    }

    get notesList() {
        return this._notesList;
    }

    formatDate(dateString) {
        if (dateString === null) {
            return '';
        }
        const date = new Date(dateString);
        console.log('createdDate>>>',date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
        const year = date.getFullYear();

        return month + '/' + day + '/' + year;
    }

}