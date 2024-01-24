@isTest
public class LocationCodeUpdaterTest {
    @TestSetup
    static void setup() {
        List<Account> testAccounts = new List<Account>();
        
        for(Integer i = 0; i < 5; i++) {
            testAccounts.add(new Account(Name = 'Test Account ' + i));
        }

        insert testAccounts;
    }

    @isTest
    public static void updateRecordsTest(){
        Map<String, Account> csvAccountsMap = new Map<String, Account>();

        for (Integer i = 0; i < 7; i++) {
            Account acc = new Account(Name = 'Test Account ' + i, BillingCity = 'New City ' + i);
            csvAccountsMap.put(acc.Name, acc);
        }

        Test.startTest();
        // Call the updateRecords method
        List<Account> updatedAccounts = LocationCodeUpdaterController.updateRecords(csvAccountsMap);
        Test.stopTest();

         // Assertions
         System.assertEquals(7, updatedAccounts.size(), 'The number of updated accounts should be 7.');

         List<Account> accountsInDb = [SELECT Id, Name, BillingCity FROM Account ];
         System.debug('Accounts>>>' + JSON.serializePretty(accountsInDb));
         System.assertEquals(7, accountsInDb.size(), 'The number of accounts in the database should be 7.');
 
    }


    // @isTest
    // public static void updateRecordsTest(){
        
    //     List<Account> accs = new List<Account>();
    //     for (Integer i = 0; i < 150; i++) {
    //         Account acc = new Account();
    //         acc.Name = 'Testaccount' + i;
    //         accs.add(acc);
    //     }

    //     test.startTest();
    //     LocationCodeUpdaterController.InsertAccountsQueueable insertAccounts = new LocationCodeUpdaterController.InsertAccountsQueueable(JSON.serialize(accountsToInsert));
    //     System.enqueueJob(insertAccounts);
    //     test.stopTest();
          
    // }

    @isTest
    static void testQueueableInsert() {
        // Prepare test data
        Map<String, Account> csvAccountsMap = new Map<String, Account>();

        for (Integer i = 0; i < 1100; i++) {
            Account acc = new Account(Name = 'Large Test Account ' + i, BillingCity = 'New City ' + i);
            csvAccountsMap.put(acc.Name, acc);
        }

        Test.startTest();
        // Call the updateRecords method
        List<Account> updatedAccounts = LocationCodeUpdaterController.updateRecords(csvAccountsMap);
        Test.stopTest();

        // Assertions
        System.assertEquals(1100, updatedAccounts.size(), 'The number of updated accounts should be 1100.');

        List<Account> accountsInDb = [SELECT Id, Name, BillingCity FROM Account WHERE Name IN :csvAccountsMap.keySet()];
        System.assertEquals(1100, accountsInDb.size(), 'The number of accounts in the database should be 1100.');
    }
        
       
}