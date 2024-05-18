public without sharing class ContactUpdaterController {
  @auraEnabled
  public static List<Contact> updateRecords(
    Map<String, Contact> csvContactsMap
  ) {
    List<Contact> contacts = [
      SELECT Id, Name, Email
      FROM Contact
      WHERE Email IN :csvContactsMap.keySet()
    ];
    System.debug('Size>>' + contacts.size());
    List<Contact> contactsToUpdate = new List<Contact>();

    for (Contact contact : contacts) {
      if (!csvContactsMap.containsKey(contact.Email))
        continue;
      Contact cont = csvContactsMap.get(contact.Email);
      System.debug('cont' + cont);
      cont.Id = contact.Id;
      contactsToUpdate.add(cont);
      csvContactsMap.remove(contact.Email);
    }

    update contactsToUpdate;

    return contactsToUpdate;
  }
}