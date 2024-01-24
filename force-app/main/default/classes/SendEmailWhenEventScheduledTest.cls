@IsTest
public class SendEmailWhenEventScheduledTest {
	@isTest
    Public static void testMethodOne(){
        Account accRec = new Account(Name = 'Test Account');
        insert accRec;
        
        Contact conRec = new Contact(LastName = 'Test', AccountId = accRec.Id);
        insert conRec;
        
        Event eventRec = new Event();
        eventRec.WhatId = accRec.id;
        eventRec.WhoId = conRec.Id;
        eventRec.StartDateTime = System.Today();
        eventRec.DurationInMinutes = 30;
        
        Test.startTest();
        insert eventRec;
        Test.stopTest();
    }
    
    @isTest
    Public static void testMethodTwo(){
        
        Event eventRec = new Event();
        eventRec.Type = 'PD - Data Fusion ScoreCelerator';
        eventRec.Status__c = 'Rescheduled';
        eventRec.StartDateTime = System.Today();
        eventRec.DurationInMinutes = 30;
        
        Test.startTest();
        insert eventRec;
        Test.stopTest();
    }
}