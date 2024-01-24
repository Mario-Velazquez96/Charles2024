public without sharing class Batch_CheckEndDateContact implements Database.Batchable<sObject>{
    private String query;

    public Batch_CheckEndDateContact() {
        this.query = generateQuery();
    }

    public Batch_CheckEndDateContact(string query) {
        this.query = query;
    }

    public Database.QueryLocator start (Database.BatchableContext batchableContext){
        return Database.getQueryLocator(this.query);
    }

    public void execute(Database.BatchableContext BC, List<Contact> scope){
        this.processContacts(scope);
    }

    public void processContacts (List<Contact> contacts){
        for (Contact con:contacts){
            con.Inactive__c = true;
        }

        this.updateContacts(contacts);
    }

    public void updateContacts(List<Contact> contactList){
        if(!contactList.isEmpty()){
            Database.update(contactList);
        }
    }

    public void finish(Database.BatchableContext BC){
    }

    public static String generateQuery(){

        String query = 'SELECT Id, Inactive__c, End_Date__c FROM Contact WHERE End_Date__c <= TODAY AND Inactive__c = false' ;
        
        return query;
    }
}