@isTest
public class ContactSearcherController_TEST {
    private static Integer BULK_SIZE = 200;

    @TestSetup
    static void makeData(){
        Account account = new Account(Name = 'accountTest');
        insert account;

        List<Contact> contactList = new List<Contact>();
        for (Integer i = 0; i < BULK_SIZE; i++) {
            Contact contact = new Contact(LastName = 'contactTest' + i, AccountId = account.Id, Email = 'testClasses@contacts.com'+i);
            contactList.add(contact);
        }
        insert contactList;
    }

    @isTest
    public static void testGetContacts(){
        List<String> contactEmails = new List<String>();
        List<ContactSearcherController.WrapContact> wrapList = new List<ContactSearcherController.WrapContact>();

        for (Integer i = 0; i < BULK_SIZE; i++) {
            String email = 'testClasses@contacts.com'+i;
            contactEmails.add(email);
        }

        test.startTest();
        wrapList = ContactSearcherController.getContacts(contactEmails);
        test.stopTest();
        System.assertEquals(wrapList.size(), 200, 'Wrong number of contact');
    }

    @isTest
    public static void testCreateRecords(){
        String accountId = [SELECT Id FROM Account WHERE Name = 'accountTest'].Id;
        List<Contact> contactList = new List<Contact>([SELECT Id FROM Contact WHERE AccountId =: accountId]);
        List<String> contactIds = new List<String>();
        String name = 'testName';
        String message;

        for (Contact con : contactList) {
            contactIds.add(con.Id);
        }

        test.startTest();
        message = ContactSearcherController.createRecords(contactIds,name);
        test.stopTest();
        System.assertEquals('Records created successfully', message, 'Wrong message');
    }
}