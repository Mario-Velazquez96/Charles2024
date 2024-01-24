@isTest
public class ContactAccountCreatorTest {
    @TestSetup
    static void makeData(){
        Account acc1 = new Account(Name = 'Test Account 1');
        insert acc1;
        
        Account acc2 = new Account(Name = 'Test Account 2');
        insert acc2;
        
        Contact con1 = new Contact(LastName = 'Test Contact 1', AccountId = acc1.Id, Email = 'TestContact1@hotmail.com');
        insert con1;

        Contact con2 = new Contact(LastName = 'Test Contact 2', AccountId = acc2.Id, Email = 'TestContact2@hotmail.com');
        insert con2;
    }

    @isTest
    public static void testGetContactNotCreated(){
        List <String> emails = new List<String>{'TestContact1@hotmail.com','TestContact2@hotmail.com','test@test.com'};

        Test.startTest();
        List<String> emailsNotCreated = ContactAccountCreatorController.getContactNotCreated(emails);
        Test.stopTest();

        System.assertEquals(1, emailsNotCreated.size(), 'There should be 1 email not created');
    }

    @isTest
    public static void testContactAccountCreator() {
        String jsonString = '[{"Email":"abar32wqth@alpinedistrict.org","FirstName":"Laura","LastName":"Abbott","Organization":"Lake Travis ISD"},{"Email":"TestConta23ct1@hotmail.com","FirstName":"Laura","LastName":"Abbott","Organization":"Test Account 2"},{"Email":"TestContact1@hotmail.com","FirstName":"Laura","LastName":"Abbott","Organization":"Lake Travis ISD"}]';
        
        Test.startTest();
        List<ContactAccountCreatorController.RecordsCreated> recordList = ContactAccountCreatorController.createRecords(jsonString);
        Test.stopTest();

        System.assertEquals(4, recordList.size(), 'There should be 4 records created');
    }
}