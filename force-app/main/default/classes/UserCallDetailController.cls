public without sharing class UserCallDetailController {
  public static final String THIS_WEEK = 'THIS_WEEK';
  public static final String LAST_WEEK = 'LAST_WEEK';
  public static final String THIS_MONTH = 'THIS_MONTH';
  public static final String LAST_MONTH = 'LAST_MONTH';

  @AuraEnabled
  public static UserCallDetailPackage getUserCallDetails(
    Id userId,
    Date startDate,
    Date endDate
  ) {
    UserCallDetailPackage UserCallDetailPackage = new UserCallDetailPackage();
    UserCallDetailPackage.callDetailsThisWeek = getTasks(
      getPeriodFilter(userId, THIS_WEEK)
    );
    UserCallDetailPackage.emailDetailsThisWeek = getEmails(
      getPeriodFilter(userId, THIS_WEEK)
    );
    UserCallDetailPackage.callDetailsLastWeek = getTasks(
      getPeriodFilter(userId, LAST_WEEK)
    );
    UserCallDetailPackage.emailDetailsLastWeek = getEmails(
      getPeriodFilter(userId, LAST_WEEK)
    );
    UserCallDetailPackage.callDetailsThisMonth = getTasks(
      getPeriodFilter(userId, THIS_MONTH)
    );
    UserCallDetailPackage.emailDetailsThisMonth = getEmails(
      getPeriodFilter(userId, THIS_MONTH)
    );
    UserCallDetailPackage.callDetailsLastMonth = getTasks(
      getPeriodFilter(userId, LAST_MONTH)
    );
    UserCallDetailPackage.emailDetailsLastMonth = getEmails(
      getPeriodFilter(userId, LAST_MONTH)
    );
    UserCallDetailPackage.callDetailsDateRange = getTasks(
      getDateRangeFilter(userId, startDate, endDate)
    );
    UserCallDetailPackage.MeetingsDetailsDateRange = getEvents(
      getDateRangeFilter(userId, startDate, endDate)
    );
    UserCallDetailPackage.callContactsOwners = getContactsOwners(
      UserCallDetailPackage.callDetailsDateRange
    );
    UserCallDetailPackage.emailDetailsDateRange = getEmails(
      getDateRangeFilter(userId, startDate, endDate)
    );
    UserCallDetailPackage.emailContactsOwners = getContactsOwners(
      UserCallDetailPackage.emailDetailsDateRange
    );
    System.debug(
      'UserCallDetailPackage: ' + UserCallDetailPackage.callDetailsDateRange
    );

    return UserCallDetailPackage;
  }

  private static Map<Id, Contact> getContactsOwners(List<Task> tasks) {
    if (tasks.isEmpty()) {
      return new Map<Id, Contact>();
    }

    Map<Id, Contact> contactsOwners = new Map<Id, Contact>();
    Set<Id> contactIds = new Set<Id>();
    for (Task task : tasks) {
      if (isContactId(task.WhoId)) {
        contactIds.add(task.WhoId);
      }
    }
    Map<Id, Contact> contactsMap = new Map<Id, Contact>(
      [
        SELECT Id, Name, Title, Main_Market__c
        FROM Contact
        WHERE Id IN :contactIds
      ]
    );

    for (Task task : tasks) {
      if (isContactId(task.WhoId)) {
        contactsOwners.put(task.Id, contactsMap.get(task.WhoId));
      }
    }

    return contactsOwners;
  }

  private static List<Task> getTasks(String filter) {
    String taskQuery = 'SELECT Id, OwnerId, Done_While_Traveling__c, Call_Result__c, ActivityDate, Owner.Name, Subject, AccountId, Account.Name, WhoId, Who.Name, Priority, CreatedBy.Name, CreatedById FROM Task';
    if (filter != null) {
      taskQuery +=
        ' WHERE Subject LIKE \'%Call%\' AND IsClosed = true AND ' + filter;
    } else {
      taskQuery += ' WHERE Subject LIKE \'%Call%\' AND IsClosed = true';
    }
    System.debug('taskQuery: ' + taskQuery);
    return Database.query(taskQuery);
  }

  private static List<Task> getEmails(String filter) {
    String taskQuery = 'SELECT Id, OwnerId, Done_While_Traveling__c, ActivityDate, Owner.Name, Subject, AccountId, Account.Name, WhoId, Who.Name, Priority, CreatedBy.Name, CreatedById FROM Task';
    if (filter != null) {
      taskQuery +=
        ' WHERE Subject LIKE \'%Email%\' AND IsClosed = true AND ' + filter;
    } else {
      taskQuery += ' WHERE Subject LIKE \'%Email%\' AND IsClosed = true';
    }
    System.debug('emailQuery: ' + taskQuery);
    return Database.query(taskQuery);
  }

  private static List<Event> getEvents(String filter) {
    String eventQuery = 'SELECT Id, OwnerId, Owner.Name, Subject, AccountId, Account.Name, WhoId, Who.Name, CreatedBy.Name, CreatedById, ActivityDate FROM Event';
    if (filter != null) {
      eventQuery += ' WHERE ' + filter;
    }
    return Database.query(eventQuery);
  }

  private static String getDateRangeFilter(
    String ownerId,
    Date startDate,
    Date endDate
  ) {
    String filter = 'OwnerId = \'' + ownerId + '\'';
    if (startDate != null && endDate != null) {
      filter +=
        ' AND ActivityDate >= ' +
        getDateFormat(startDate) +
        ' AND ActivityDate <= ' +
        getDateFormat(endDate);
    } else if (startDate != null) {
      filter += ' AND ActivityDate >= ' + getDateFormat(startDate);
    } else if (endDate != null) {
      filter += ' AND ActivityDate <= ' + getDateFormat(endDate);
    }
    return filter;
  }

  private static String getDateFormat(Date dateValue) {
    System.debug('startDateMethod: ' + dateValue);
    Integer d = dateValue.day();
    Integer mo = dateValue.month();
    Integer yr = dateValue.year();

    String formattedDate =
      yr +
      '-' +
      String.valueOf(mo).leftPad(2, '0') +
      '-' +
      String.valueOf(d).leftPad(2, '0');
    System.debug('DT: ' + formattedDate);
    return formattedDate;
  }

  private static String getPeriodFilter(String ownerId, String period) {
    String filter = 'OwnerId = \'' + ownerId + '\'';
    if (period == THIS_WEEK) {
      filter += ' AND ActivityDate = THIS_WEEK';
    } else if (period == LAST_WEEK) {
      filter += ' AND ActivityDate = LAST_WEEK';
    } else if (period == THIS_MONTH) {
      filter += ' AND ActivityDate = THIS_MONTH';
    } else if (period == LAST_MONTH) {
      filter += ' AND ActivityDate = LAST_MONTH';
    }
    return filter;
  }

  private static Boolean isContactId(String whoId) {
    return whoId != null && whoId.startsWith('003');
  }

  public class UserCallDetailPackage {
    @AuraEnabled
    public List<Task> callDetailsThisWeek { get; set; }

    @AuraEnabled
    public List<Task> emailDetailsThisWeek { get; set; }

    @AuraEnabled
    public List<Task> callDetailsLastWeek { get; set; }

    @AuraEnabled
    public List<Task> emailDetailsLastWeek { get; set; }

    @AuraEnabled
    public List<Task> callDetailsThisMonth { get; set; }

    @AuraEnabled
    public List<Task> emailDetailsThisMonth { get; set; }

    @AuraEnabled
    public List<Task> callDetailsLastMonth { get; set; }

    @AuraEnabled
    public List<Task> emailDetailsLastMonth { get; set; }

    @AuraEnabled
    public List<Task> callDetailsDateRange { get; set; }

    @AuraEnabled
    public List<Task> emailDetailsDateRange { get; set; }

    @AuraEnabled
    public List<Event> meetingsDetailsDateRange { get; set; }

    @AuraEnabled
    public Map<Id, Contact> callContactsOwners { get; set; }

    @AuraEnabled
    public Map<Id, Contact> emailContactsOwners { get; set; }
  }
}