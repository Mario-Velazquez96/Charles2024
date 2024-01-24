public without sharing class ContactAccountCreatorController {
    public class RecordsCreated{
        @AuraEnabled
        public String Id {get; set;}
        @AuraEnabled
        public String Name{get; set;}
        @AuraEnabled
        public String Url{get; set;}
        @AuraEnabled
        public String ObjectType{get; set;}
    }
    @AuraEnabled
    public static List<String> getContactNotCreated(List<String> contactEmails){
        try {
            Map<String,String> emailToLowercaseMap = new Map<String,String>();
            Set<String> setcontactEmails = new Set<String>();
            Set<String> emailsInDataBase = new Set<String>();
            List<Contact> contactsInDataBase = new List<Contact>();

            for (String e : contactEmails) {
                if (String.isNotBlank(e)) {
                    String email = e.toLowerCase();
                    emailToLowercaseMap.put(email, e);
                    setcontactEmails.add(email);
                }  
            }
            System.debug('set email>>'+ setcontactEmails);

            contactsInDataBase = [SELECT Id, Email 
                                    FROM Contact 
                                    WHERE Email IN :setcontactEmails];
            
            for (Contact con : contactsInDataBase) {
                if (String.isNotBlank(con.Email)) {
                    emailsInDataBase.add(con.Email);
                }  
            }
            System.debug('set emailsInDataBase>>'+ emailsInDataBase);
            for (String email : emailsInDataBase) {
                if (setcontactEmails.contains(email)) {
                    emailToLowercaseMap.remove(email);
                }
            }

            List<String> emailsToReturn = new List<String>(emailToLowercaseMap.values());
            System.debug('emailsToReturn>>'+ emailsToReturn);
            return emailsToReturn;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<RecordsCreated> createRecords (String jsonString){
        try {
            List<ContactWrapper> contactWrappers = (List<ContactWrapper>)JSON.deserialize(jsonString, List<ContactWrapper>.class);
            Map<String,ContactWrapper> contactWrapperMap = new Map<String,ContactWrapper>();
            List<Account> accountsToCreate = new List<Account>();
            List<Contact> contactsToCreate = new List<Contact>();
            Map<String,Account> accountMap = new Map<String,Account>();
            List<RecordsCreated> recordsCreated = new List<RecordsCreated>();
            
            for (ContactWrapper cw : contactWrappers) {
                if (String.isNotBlank(cw.Organization)) {
                    contactWrapperMap.put(cw.Organization, cw);
                }
            }

            List<Account> accounts = [SELECT Id, Name 
                                        FROM Account 
                                        WHERE Name IN :contactWrapperMap.keySet()];

            for (Account a : accounts) {
                accountMap.put(a.Name, a);
            }


            for (ContactWrapper cw : contactWrappers) {
                if (String.isNotBlank(cw.Organization)) {
                    if (accountMap.containsKey(cw.Organization)) {
                        Contact con = new Contact();
                        con.FirstName = cw.FirstName;
                        con.LastName = cw.LastName;
                        con.Email = cw.Email;
                        con.Phone = cw.Phone;
                        con.Title = cw.Title;
                        con.AccountId = accountMap.get(cw.Organization).Id;
                        contactsToCreate.add(con);
                    } else {
                        Account a = new Account();
                        a.Name = cw.Organization;
                        a.ShippingStreet = cw.Street;
                        a.ShippingCountry = cw.Country != null ? cw.Country : 'United States';
                        a.ShippingCity = cw.City;
                        a.ShippingStateCode = cw.State;
                        a.ShippingPostalCode = cw.Zip;
                        accountMap.put(a.Name, a);
                        accountsToCreate.add(a);
                    }
                }
            }

            insert accountsToCreate;

            for (Account a : accountsToCreate) {
                Contact con = new Contact();
                con.FirstName = contactWrapperMap.get(a.Name).FirstName;
                con.LastName = contactWrapperMap.get(a.Name).LastName;
                con.Email = contactWrapperMap.get(a.Name).Email;
                con.Phone = contactWrapperMap.get(a.Name).Phone;
                con.Title = contactWrapperMap.get(a.Name).Title;
                con.AccountId = a.Id;
                contactsToCreate.add(con);
            }

            insert contactsToCreate;

            for (Account acc : accountsToCreate) {
                RecordsCreated rw = new RecordsCreated();
                rw.Id = acc.Id;
                rw.Name = acc.Name;
                rw.Url = '/' + acc.Id;
                rw.ObjectType = 'Account';
                recordsCreated.add(rw);
            }

            for (Contact c : contactsToCreate) {
                RecordsCreated rw = new RecordsCreated();
                rw.Id = c.Id;
                rw.Name = c.FirstName + ' ' + c.LastName;
                rw.Url = '/' + c.Id;
                rw.ObjectType = 'Contact';
                recordsCreated.add(rw);
            }

            return recordsCreated;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}