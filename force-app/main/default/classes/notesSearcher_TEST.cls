@isTest
public class notesSearcher_TEST {
    @TestSetup
    static void makeData(){
        Account account = new Account(Name = 'accountTest');
        insert account;

        Note note = new Note(Title = 'noteTest', Body = 'TESTBODY',ParentId = account.Id);
        insert note;


        List<Contact> contactList = new List<Contact>();
        for (Integer i = 0; i < 5; i++) {
            Contact contact = new Contact(LastName = 'contactTest' + i, AccountId = account.Id);
            contactList.add(contact);
        }
        insert contactList;

        List<Note> noteList = new List<Note>();
        for (Contact c : contactList) {
            Note note1 = new Note(Title = 'noteTest', Body = 'TESTBODY',ParentId = c.Id);
            noteList.add(note1);
        }
        insert noteList;

        ContentNote objCntNote = new ContentNote();
        objCntNote.Title = 'salesforce code crack';
        objCntNote.Content = Blob.valueOf('Welcome to salesforcecodecrack.com');
        insert objCntNote; //Insert Content Note   

        //create ContentDocumentLink  record to link with parentId 
        ContentDocumentLink objCntDocLink = new ContentDocumentLink();
        objCntDocLink.LinkedEntityId = account.Id; // Specify your parent Id 
        objCntDocLink.ContentDocumentId = objCntNote.Id;  //Content Note Id
        objCntDocLink.shareType = 'V'; // Specify your sharing type 
        insert objCntDocLink;

        ContentNote objCntNote1 = new ContentNote();
        objCntNote1.Title = 'salesforce code crack';
        objCntNote1.Content = Blob.valueOf('Welcome to salesforcecodecrack.com');
        insert objCntNote1; //Insert Content Note   

        //create ContentDocumentLink  record to link with parentId 
        ContentDocumentLink objCntDocLink1 = new ContentDocumentLink();
        objCntDocLink1.LinkedEntityId = contactList[0].Id; // Specify your parent Id 
        objCntDocLink1.ContentDocumentId = objCntNote1.Id;  //Content Note Id
        objCntDocLink1.shareType = 'V'; // Specify your sharing type 
        insert objCntDocLink1;
    }

    @isTest
    public static void testGetNotes(){
        String accountId = [SELECT Id FROM Account WHERE Name = 'accountTest'].Id;
        test.startTest();
        List<notesSearcherController.WrapperNotes> notes = notesSearcherController.getNotes(accountId);
        test.stopTest();
        System.assertEquals(notes.size(), 8, 'Wrong number of notes');
    }

    @isTest
    public static void testSearch(){
        test.startTest();
        List<sObject> accounts = notesSearcherLookupController.search('accountTest', 'Account','');
        test.stopTest();
        System.assertEquals(accounts.size(), 1, 'Wrong number of accounts');
    }

    @isTest
    public static void testTableController(){
        // test.startTest();
        // NotesTableController test1 = new NotesTableController();
        // List<notesSearcherController.WrapperNotes> notes = test1.getNotes();
        // test.stopTest();
        // test.startTest();
        // String accId = [SELECT Id FROM Account WHERE Name = 'accountTest'].Id;
        // NotesTableController test1 = new NotesTableController(accountId =accId );
        // List<NotesTableController.limitWrapper> notes = test1.getThousandBlocks();
        // test.stopTest();
        
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'accountTest' LIMIT 1];
        String accountId = testAccount.Id;

        Test.setCurrentPageReference(new PageReference('Page.NotesTable'));
        ApexPages.currentPage().getParameters().put('school', accountId);
        test.startTest();
        NotesTableController controller = new NotesTableController();
        List<NotesTableController.limitWrapper> thousandBlocks = controller.getThousandBlocks();
        test.stopTest();
    }
}