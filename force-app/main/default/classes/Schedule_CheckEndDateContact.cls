global class Schedule_CheckEndDateContact implements Schedulable {
    global void execute(SchedulableContext sc) {
        Database.executeBatch(new Batch_CheckEndDateContact());
    }
}