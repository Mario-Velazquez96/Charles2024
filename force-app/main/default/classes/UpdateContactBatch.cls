public without sharing class UpdateContactBatch implements Database.Batchable<sObject>{
    private String query;

    public UpdateContactBatch(){
        this.query = generateQuery();
    }

    public UpdateContactBatch(string query){
        this.query = query;
    }

    public Database.QueryLocator start (Database.BatchableContext batchableContext){
        return Database.getQueryLocator(this.query);
    }

    public void execute(Database.BatchableContext BC, List<Contact> scope){
        this.processContacts(scope);
    }

    public void processContacts (List<Contact> contactList){
        List<Contact> contactsToUpdate = new List<Contact>();

        for(Contact con: contactList){
            String marketingCodeList;
            
            for(Contact_Marketing_Code__c code: con.Contact_Marketing_Code__r){
                marketingCodeList= marketingCodeList + code.Name + ',';
            }

            con.Marketing_Code_List__c = marketingCodeList;

            if(String.isNotBlank( con.Marketing_Code_List__c)){
                contactsToUpdate.add(con);
            }

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

        String query = 'SELECT Id, Name, Marketing_Code_List__c, (Select Name,Contact__c From Contact_Marketing_Code__r)' +
                            'FROM Contact ' + 
                            'WHERE Id IN (Select Contact__c From Contact_Marketing_Code__c)';
        return query;
    }


}