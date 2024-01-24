public without sharing class LocationCodeUpdaterController {
    @auraEnabled
    public static List<Account> updateRecords(Map<String, Account> csvAccountsMap){

        List<Account> accounts = [SELECT Id, Name FROM Account WHERE Name IN :csvAccountsMap.keySet()];
        System.debug('Size>>' + accounts.size());
        List<Account> accountsToUpdate = new List<Account>();
        List<Account> accountsToInsert = new List<Account>();
        List<Account> accountsToUpsert = new List<Account>();

        for(Account account : accounts){
            if (!csvAccountsMap.containsKey(account.Name)) continue;
            Account acc = csvAccountsMap.get(account.Name);
            System.debug('Acc' + acc);
            acc.Id = account.Id;
            accountsToUpdate.add(acc);
            csvAccountsMap.remove(account.Name);
    }

        for(Account csvAccount : csvAccountsMap.values()){
            if(String.isNotBlank(csvAccount.Name)){
                accountsToInsert.add(csvAccount);
            }
        }

        update accountsToUpdate;
        if (!accountsToInsert.isEmpty() && accountsToInsert.size() > 1000) {
            InsertAccountsQueueable insertAccounts = new InsertAccountsQueueable(JSON.serialize(accountsToInsert));
            System.enqueueJob(insertAccounts);
        } else if (!accountsToInsert.isEmpty()) {
            insert accountsToInsert;
        }
        

        accountsToUpdate.addAll(accountsToInsert);
        return accountsToUpdate;
    }

    public class InsertAccountsQueueable implements Queueable {
        private String accountsJson;
    
        public InsertAccountsQueueable(String accountsJson) {
            this.accountsJson = accountsJson;
        }
    
        public void execute(QueueableContext context) {
            List<Account> csvAccounts = (List<Account>)JSON.deserialize(accountsJson, List<Account>.class);
            
            
    
            insert csvAccounts;
        }
    }
}