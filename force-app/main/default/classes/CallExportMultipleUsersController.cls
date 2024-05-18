public without sharing class CallExportMultipleUsersController {
  @AuraEnabled(cacheable=true)
  public static List<User> getUsers() {
    List<User> userList = [
      SELECT Id, Name, Email, Phone
      FROM User
      WHERE Profile.Name = 'CES Standard User' AND IsActive = TRUE
      ORDER BY Name
      LIMIT 30
    ];
    return userList;
  }
}