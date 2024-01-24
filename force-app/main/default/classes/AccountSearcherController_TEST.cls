@isTest
public class AccountSearcherController_TEST {
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
    List<String> accountName = new List<String>();
    accountName.add('accountTest');

    List<AccountSearcherController.WrapContact> wrapList = new List<AccountSearcherController.WrapContact>();
    test.startTest();
    wrapList = AccountSearcherController.getContacts(accountName);
    test.stopTest();

    System.assertEquals(wrapList.size(),200,'Should be 200 contacts retrieved');

    }

}