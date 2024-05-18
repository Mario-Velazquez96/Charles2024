@isTest
public class ContactUpdaterTest {
  @TestSetup
  static void setup() {
    List<Account> testAccounts = new List<Account>();

    for (Integer i = 0; i < 5; i++) {
      testAccounts.add(new Account(Name = 'Test Account ' + i));
    }

    insert testAccounts;

    List<Contact> testContacts = new List<Contact>();
    for (Integer i = 0; i < 5; i++) {
      testContacts.add(
        new Contact(
          FirstName = 'Test Contact ' + i,
          LastName = 'Test Last' + i,
          Email = 'test' + i + '@test.com',
          AccountId = testAccounts[i].Id
        )
      );
    }

    insert testContacts;
  }

  @isTest
  public static void updateRecordsTest() {
    Map<String, Contact> csvContactsMap = new Map<String, Contact>();

    for (Integer i = 0; i < 7; i++) {
      Contact con = new Contact(
        Email = 'test' + i + '@test.com',
        Main_Market__c = 'Market ' + i
      );
      csvContactsMap.put(con.Email, con);
    }

    Test.startTest();
    // Call the updateRecords method
    List<Contact> updatedContacts = ContactUpdaterController.updateRecords(
      csvContactsMap
    );
    Test.stopTest();

    // Assertions
    System.assertEquals(
      5,
      updatedContacts.size(),
      'The number of updated accounts should be 5.'
    );

    List<Contact> contactsInDb = [
      SELECT Id, Name, Main_Market__c
      FROM Contact
      WHERE Main_Market__c = 'Market 1'
    ];
    System.debug('Accounts>>>' + JSON.serializePretty(contactsInDb));
    System.assertEquals(
      1,
      contactsInDb.size(),
      'The number of accounts in the database should be 1'
    );
  }
}