public without sharing class Batch_CheckEndDateRealationship implements Database.Batchable<sObject>{
    private String query;
    
    public Batch_CheckEndDateRealationship() {
        this.query = generateQuery();
    }

    public Batch_CheckEndDateRealationship(string query){
        this.query = query;
    }

    public Database.QueryLocator start (Database.BatchableContext batchableContext){
        return Database.getQueryLocator(this.query);
    }

    public void execute(Database.BatchableContext BC, List<AccountContactRelation> scope){
        this.processRelationships(scope);
    }

    public void processRelationships (List<AccountContactRelation> relationshipList){
        Set<Id> contactIdSet = new Set<Id>();
        List<Contact> contactsToUpdate = new List<Contact>();
        
        for(AccountContactRelation relationship : relationshipList){
            contactIdSet.add(relationship.ContactId);
        }

        for(Id contactId : contactIdSet){
            Contact contact = new Contact(Id = contactId, Inactive__c = true);
            contactsToUpdate.add(contact);
        }

        this.updateContacts(contactsToUpdate);
    }

    public void updateContacts(List<Contact> contactList){
        if(!contactList.isEmpty()){
            Database.update(contactList);
        }
    }

    public void finish(Database.BatchableContext BC){
    }

    public static String generateQuery(){

        String query = 'SELECT Id, ContactId, Contact.Inactive__c, EndDate FROM AccountContactRelation WHERE EndDate <= TODAY AND Contact.Inactive__c = false' ;
        
        return query;
    }
}