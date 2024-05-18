@isTest
public class CallExportMultipleUsersControllerTest {
  @isTest
  private static void getUsersTest() {
    List<User> users = CallExportMultipleUsersController.getUsers();

    Assert.isNotNull(users);
  }
}