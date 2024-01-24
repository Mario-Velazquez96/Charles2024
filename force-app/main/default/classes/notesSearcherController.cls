public without sharing class notesSearcherController {

    Public static map<String, String> documentLinkContactsMap = new map<String,String>();
    Public static Set<Id> contactIds = new Set<Id>();
    Public static List<WrapperNotes> notes = new List<WrapperNotes>();
    Public static Set<Id> accountContentNotesIds = new Set<Id>();

    @AuraEnabled (cacheable=true)
    public static List<WrapperNotes> getNotes(String accountId){
        try {
            List<Account> accounts = [SELECT Id, Name, (SELECT Id, Body, Title,CreatedDate,CreatedBy.Name FROM Notes),(SELECT Id, Name FROM Contacts) FROM Account WHERE Id = :accountId LIMIT 1];
            
            if (accounts.size() > 0) {
                getRelatedAccountNotes(accounts);
                getRelatedAccountContentNotes(accounts,accountId);
                if(contactIds.size() > 0){
                    getRelatedContactNotes();
                    getRelatedContactContentNotes();
                }

                //sort notes by date
                notes.sort();

                return notes; 
            } else {
                return null;
            }
            

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public static void getRelatedAccountNotes(List<Account> accounts){
        for(Account acc : accounts){
            for(Contact con : acc.Contacts){
                contactIds.add(con.Id);
            }
            for(Note n : acc.Notes){
                addWrapperFromNote(n,'Account',acc.Name);
            }
        }
    }

    public static void getRelatedContactNotes(){
        List<Contact> contactsNotes = [SELECT Id, Name, (SELECT Id, Body, Title,CreatedDate,CreatedBy.Name FROM Notes) FROM Contact WHERE Id IN :contactIds];

        for (Contact con : contactsNotes) {
            for(Note n : con.Notes){
                addWrapperFromNote(n,'Contact',con.Name);
            }
        }
    }

    public static void getRelatedAccountContentNotes(List<Account> accounts,String accountid){
        List<ContentDocumentLink> accountLinks = [SELECT Id, LinkedEntityId,ContentDocumentId,LinkedEntity.Name
                                                    FROM ContentDocumentLink 
                                                    WHERE ContentDocument.FileType = 'SNOTE' AND LinkedEntityId =:accountid];

        for (ContentDocumentLink link :accountLinks){
            accountContentNotesIds.add(link.ContentDocumentId);
        }

        if(accountContentNotesIds.size() > 0){
            for(ContentNote accNotes : [SELECT Id,Content,Title,CreatedDate,CreatedBy.Name FROM ContentNote WHERE Id IN :accountContentNotesIds]){
                addWrapperFromContentNote(accNotes,'Account',accounts[0].Name);    
            }
        } 
    }

    public static void getRelatedContactContentNotes(){
        List<ContentDocumentLink> contactLinks = [SELECT Id, LinkedEntityId,ContentDocumentId,LinkedEntity.Name
                                                    FROM ContentDocumentLink 
                                                    WHERE ContentDocument.FileType = 'SNOTE' AND LinkedEntityId IN :contactIds];

        for (ContentDocumentLink link : contactLinks){
            documentLinkContactsMap.put(link.ContentDocumentId,link.LinkedEntity.Name);
        }

        if (contactLinks.size() > 0) {
            for(ContentNote contNotes : [SELECT Id,Content,Title,CreatedDate,CreatedBy.Name FROM ContentNote WHERE Id IN :documentLinkContactsMap.keySet()]){
                addWrapperFromContentNote(contNotes, 'Contact', documentLinkContactsMap.get(contNotes.Id));
            }
        }   
    }

    public static void addWrapperFromNote(Note note,String objectType,String ownerName){
        WrapperNotes wrapper = new WrapperNotes();
        wrapper.id = note.Id;
        wrapper.title = note.Title;
        wrapper.body = note.Body;
        wrapper.ownerName = ownerName;
        wrapper.objectType = objectType;
        wrapper.createdDate = note.CreatedDate.date();
        wrapper.userName = note.CreatedBy.Name;
        notes.add(wrapper);
    }

    public static void addWrapperFromContentNote(ContentNote note,String objectType,String ownerName){
        WrapperNotes wrapper = new WrapperNotes();
        wrapper.id = note.Id;
        wrapper.title = note.Title;
        Blob myBlob = note.Content;
        String stringBody = EncodingUtil.base64Decode(EncodingUtil.base64Encode(myBlob)).toString().replaceAll('<[^>]+>',' ');
        wrapper.body = stringBody;
        wrapper.ownerName = ownerName;
        wrapper.objectType = objectType;
        wrapper.createdDate = note.CreatedDate.date();
        wrapper.userName = note.CreatedBy.Name;
        notes.add(wrapper);
    }

    //add extra things
    @AuraEnabled (cacheable=true)
    public static List<String> getPrint(String accountId){
        List <String> pageStrings = new List<String>();
        PageReference pdfPage = new Pagereference('/apex/notesTable?school=' + accountId);
        Blob pdfBlob = pdfPage.getContent();
        String downloadURL = EncodingUtil.base64Encode(pdfBlob);

        pageStrings.add(downloadURL);
        pageStrings.add(pdfPage.getUrl());

        return pageStrings;
    }
    //end


    public class WrapperNotes implements Comparable{
        @AuraEnabled
        public String id {get; set;}
        @AuraEnabled
        public String title{get; set;}
        @AuraEnabled
        public String body{get; set;}
        @AuraEnabled
        public String ownerName{get; set;}
        @AuraEnabled
        public String objectType{get; set;}
        @AuraEnabled
        public Date createdDate{get; set;}
        @AuraEnabled
        public String userName{get; set;}

        public Integer compareTo(Object compareTo) {
            WrapperNotes compareToEmp = (WrapperNotes)compareTo;
            if (this.createdDate > compareToEmp.createdDate) return -1;
            if (this.createdDate < compareToEmp.createdDate) return 1;
            return 0;
        }

    }
}