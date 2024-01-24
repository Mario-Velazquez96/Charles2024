public without sharing class AccountSearcherController {
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
        public String Title{get; set;}
        @AuraEnabled
        public String MainMarket{get; set;}
        @AuraEnabled
        public String SubMarket{get; set;}
        @AuraEnabled
        public String SchoolAddress{get; set;}
        @AuraEnabled
        public String Phone{get; set;}
        @AuraEnabled
        public String ZipCode{get; set;}
        @AuraEnabled
        public String City{get; set;}
        @AuraEnabled
        public String State{get; set;}
        @AuraEnabled
        public String ContactUrl;
        @AuraEnabled
        public String AccountUrl;
    }
    
    @AuraEnabled
    public static List<WrapContact> getContacts(List<String> accountsName){
        Set<String> names = new Set<String>();
        
        List<WrapContact> wrapList = new List<WrapContact>();
        Set<String> accountIds = new Set<String>();

        for (String name : accountsName) {
            if (!String.isBlank(name)) {
                names.add(name);
            }
        }
        
        List<Account> accountList = new List<Account>([SELECT Id FROM Account WHERE Name IN : names]);
        
        for (Account acc : accountList) {
            accountIds.add(acc.Id);
        }

        List<Contact> contactList = new List<Contact>([SELECT Id,Account_State__c,Account_City__c,Account_Zip__c, Account.Name, AccountId, Name, Email, Title, Main_Market__c, Sub_Market__c, Account_Street_Address__c, Phone FROM Contact WHERE AccountId IN : accountIds]);
        
        for (Contact c : contactList) {
            WrapContact wc = new WrapContact();
            wc.Id = c.Id;
            wc.AccountName = c.Account.Name;
            wc.Email = c.Email;
            wc.Name = c.Name;
            wc.AccountId = c.AccountId;
            wc.ContactUrl = '/'+c.Id;
            wc.AccountUrl = '/'+c.AccountId;
            wc.Title = c.Title;
            wc.MainMarket = c.Main_Market__c;
            wc.SubMarket = c.Sub_Market__c;
            wc.SchoolAddress = c.Account_Street_Address__c;
            wc.Phone = c.Phone;
            wc.ZipCode = c.Account_Zip__c;
            wc.City = c.Account_City__c;
            wc.State = c.Account_State__c;
            wrapList.add(wc);
        }

        return wrapList;
    }

}