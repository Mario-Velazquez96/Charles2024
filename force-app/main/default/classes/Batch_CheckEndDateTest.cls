@isTest
public with sharing class Batch_CheckEndDateTest {
    @TestSetup
    static void makeData(){
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Account testAccount2 = new Account(Name = 'Test Account2');
        insert testAccount2;

        Contact testContact = new Contact(LastName = 'Test Contact', AccountId = testAccount.Id);
        insert testContact;

        Contact testContact2 = new Contact(LastName = 'Test Contact2', AccountId = testAccount.Id, End_Date__c = Date.Today());
        insert testContact2;
        

        AccountContactRelation testAccountContactRelation = [SELECT Id FROM AccountContactRelation WHERE AccountId =: testAccount.Id AND ContactId =: testContact.Id];   
        testAccountContactRelation.EndDate = Date.Today();
        update testAccountContactRelation;
    }

    @IsTest
    static void testScheduleAndBatch(){
        
        Test.startTest();
            SchedulableContext sc = null;
            Schedule_CheckEndDateRelationship tsc = new Schedule_CheckEndDateRelationship();
            tsc.execute(sc);
        Test.stopTest();
        
    }

    @IsTest
    static void testScheduleAndBatchContact(){
        
        Test.startTest();
            SchedulableContext sc = null;
            Schedule_CheckEndDateContact tsc = new Schedule_CheckEndDateContact();
            tsc.execute(sc);
        Test.stopTest();
        
    }
}