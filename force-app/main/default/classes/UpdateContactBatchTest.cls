@isTest
public with sharing class UpdateContactBatchTest {
    @TestSetup
    static void makeData(){
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Contact testContact = new Contact(LastName = 'Test Contact', AccountId = testAccount.Id);
        insert testContact;

        List<Contact_Marketing_Code__c> codes = new List<Contact_Marketing_Code__c>();
        
        for(integer i = 0; i < 10; i++){
            Contact_Marketing_Code__c testCode = new Contact_Marketing_Code__c();
            testCode.Contact__c = testContact.Id;
            testCode.Name = 'Test Code' + i;
            codes.add(testCode);
        }

        insert codes;                                   
    }

    @IsTest
    static void testScheduleAndBatch(){
        
        Test.startTest();
            SchedulableContext sc = null;
            UpdateContactSchedule tsc = new UpdateContactSchedule();
            tsc.execute(sc);
        Test.stopTest();
        
    }
}