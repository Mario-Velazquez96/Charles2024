public class SendMailWhenEventScheduled {
    public static string schoolName;
    public static string contactName;
    public static string schoolId;
    public static string contactId;
    
    public static void getAccountAndContact(Id eventId){
        Event objEvent = [SELECT Id, WhoId, WhatId, Subject, Description, Type FROM Event WHERE Id =: eventId];
        System.debug('WhoId: '+objEvent.WhoId);
        System.debug('WhatId: '+objEvent.WhatId);
        String schoolId = objEvent.WhatId;
        String conId = objEvent.WhoId;
        if(schoolId != '' && schoolId != null){
            List <Account> accList = new List<Account>([SELECT Id, Name, School_Id__c FROM Account WHERE Id =: objEvent.WhatId]);
            schoolName = accList[0].Name;
            schoolId = accList[0].School_Id__c;
        }
        if(conId != '' && conId != null){
            //Contact conObj = [SELECT Id, Name, Contact_Id__c, AccountId, Account.Name, Account.School_Id__c 
            //FROM Contact WHERE Id =: objEvent.WhoId];
            //contactName = conObj.Name;
            
            List <Contact> conList = new List<Contact>();
            conList = [SELECT Id, Name, Contact_Id__c, AccountId, Account.Name, Account.School_Id__c FROM Contact WHERE Id =: objEvent.WhoId];
            if(conList.size()>0){
                contactName = conList[0].Name;
            	contactId = conList[0].Contact_Id__c;
                if(schoolName == '' || schoolName == null){
                	schoolName = conList[0].Account.Name;
                	schoolId = conList[0].Account.School_Id__c;
            	}
            }
            
            /*if(schoolName == '' || schoolName == null){
                schoolName = conObj.Account.Name;
                schoolId = conObj.Account.School_Id__c;
            }*/
        }
        sendEmail(eventId, schoolName, schoolId, contactName, contactId);
    }
    
    public static void sendEmail(Id eventId, String schoolName, String schoolId, String contactName, String contactId){
        Event objEvent = [SELECT Id, WhoId, WhatId, Subject, Description, Type, StartDateTime, OwnerId, CreatedById, CreatedBy.Name,Status__c,
                          CreatedDate, IscarNeeded__c, IsFlightNeeded__c, IsHotelNeeded__c, Owner_Name__c FROM Event WHERE Id =: eventId];
        
        String dt = objEvent.StartDateTime.format('MM/dd/yyyy') + ' at ' + objEvent.StartDateTime.format('hh:mm a');
        System.debug('Date: '+dt);
        
        String status;
        String type;
        String meetType;
        
        if(objEvent.Status__c == '' || objEvent.Status__c == null){
            status = '';
        }else status = objEvent.Status__c;
        if(objEvent.Type == '' || objEvent.Type == null){
            type = 'meet/call';
            meetType = 'Meeting Type: ' + '\n';
        }else{
            type = objEvent.Type;
            meetType = 'Meeting Type: ' + objEvent.Type + '\n';
        } 
        
        String con;
        String acc;
        
        if((contactName == '' || contactName == null) && (contactId == '' || contactId == null)){
            con = '';
            contactName = '';
        }else{
            con = 'with ' + contactName + ' ID #' + contactId;
            contactName = ' with ' + contactName;
        } 
        if((schoolName == '' || schoolName == null) && (schoolId == '' || schoolId == null)){
            acc = '';
            schoolName = '';
        }else{
            acc = ' at ' + schoolName + ' ID #' + schoolId;
            schoolName = ' at ' + schoolName;
        } 
        
        Messaging.SingleEmailMessage semail= new Messaging.SingleEmailMessage();
        String subject = objEvent.Owner_Name__c + ' ' + status + ' ' + type + contactName + schoolName + ' for ' + dt;
        semail.setSubject(subject);
        
        String body = 'A ' + status + ' ' + type + ' has been scheduled ' + con + acc + ' for ' + objEvent.Owner_Name__c + ' on ' + dt + '.';
        body += '\n' + meetType;
        body += '\n' + 'Notes: '+ objEvent.Description;
        body += '\n \n';
        body += 'Car Needed: '+ objEvent.IscarNeeded__c + '\n';
		body += 'Flight Needed: '+ objEvent.IsFlightNeeded__c + '\n';
		body += 'Hotel Needed: '+ objEvent.IsHotelNeeded__c;
        body += '\n \n' + 'Scheduled By: ';
        body += objEvent.CreatedBy.Name +' on ' +objEvent.CreatedDate.format('MM/dd/yyyy')  + ' at ' + objEvent.CreatedDate.format('hh:mm a');
        
        semail.setPlainTextBody(body);
        List<String> sendTo = new List<String>(); 
        
        List <User> userList = new List<User>([SELECT ID, Name, Email FROM User WHERE Name = 'Sales Huntgroup']);
        if(userList.size() > 0){
            sendTo.add(userList[0].Email);
        }
        //sendTo.add('gkemburu@vieosolutions.com');
        semail.setToAddresses(sendTo);
        //semail.setWhatId(conObj.Id);
        //semail.setSaveAsActivity(true); 
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{semail});
    }
}