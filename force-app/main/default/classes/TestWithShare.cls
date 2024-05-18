public with sharing class TestWithShare {
  public static void testFields() {
    Opportunity opp = new Opportunity();
    List<Opportunity> opps = [
      SELECT Id, Test_Field__c
      FROM Opportunity
      WHERE Id = '0066g00003c8vXPAAY'
    ];
    System.debug('Test>>>' + opps[0].Test_Field__c);
  }
}