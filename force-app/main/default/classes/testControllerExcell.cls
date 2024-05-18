public with sharing class testControllerExcell {
  @AuraEnabled(cacheable=true)
  public static List<Account> getAccounts() {
    List<Account> accountList = [
      SELECT Id, Name, ShippingCity, ShippingState
      FROM Account
      LIMIT 20
    ];
    return accountList;
  }

  @AuraEnabled(cacheable=true)
  public static List<User> getUsers() {
    List<User> userList = [
      SELECT Id, Name, Email, Phone
      FROM User
      WHERE Profile.Name = 'CES Standard User'
      LIMIT 30
    ];
    return userList;
  }
}