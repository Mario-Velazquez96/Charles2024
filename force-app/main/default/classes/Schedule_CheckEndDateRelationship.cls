global class Schedule_CheckEndDateRelationship implements Schedulable {
    global void execute(SchedulableContext sc) {
        Database.executeBatch(new Batch_CheckEndDateRealationship());
    }
}