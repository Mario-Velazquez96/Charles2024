public without sharing class ContactSearcherController {
    public class WrapContact{
        @AuraEnabled
        public String Id {get; set;}
        @AuraEnabled
        public String AccountName{get; set;}
        @AuraEnabled
        public String Email{get; set;}
        @AuraEnabled
        public String Name{get; set;}
        @AuraEnabled
        public String AccountId{get; set;}
        @AuraEnabled
        public String ContactUrl;
        @AuraEnabled
        public String AccountUrl;
    }
    
    @AuraEnabled
    public static List<WrapContact> getContacts(List<String> contactsEmail){
        Set<String> emails = new Set<String>();
        
        List<WrapContact> wrapList = new List<WrapContact>();

        for (String email : contactsEmail) {
            if (!String.isBlank(email)) {
                emails.add(email);
            }
        }

        List<Contact> contactList = new List<Contact>([SELECT Id, Account.Name, AccountId, Name, Email FROM Contact WHERE Email IN : emails]);
        
        for (Contact c : contactList) {
            WrapContact wc = new WrapContact();
            wc.Id = c.Id;
            wc.AccountName = c.Account.Name;
            wc.Email = c.Email;
            wc.Name = c.Name;
            wc.AccountId = c.AccountId;
            wc.ContactUrl = '/'+c.Id;
            wc.AccountUrl = '/'+c.AccountId;
            wrapList.add(wc);
        }

        return wrapList;
    }

    @AuraEnabled
    public static String createRecords(List<String> contactsId, String codeName){
        List<Contact_Marketing_Code__c> codesToInsert = new List<Contact_Marketing_Code__c>();
        Set<Id> idsToUpdate = new Set<Id>();
        String message;

        for (String id : contactsId) {
            idsToUpdate.add(id);
        }

        for (String id : idsToUpdate) {
            Contact_Marketing_Code__c cmc = new Contact_Marketing_Code__c();
            cmc.Contact__c = id;
            cmc.Name = codeName;
            codesToInsert.add(cmc);
        }
        try {
            insert codesToInsert;
            //id job
            message = 'Records created successfully';
        } catch (Exception e) {
            System.debug(e.getMessage());
            message = 'Some error occured. Please reach out to your System Admin';
        }
        return message;
    }
}