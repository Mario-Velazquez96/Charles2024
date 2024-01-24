global class UpdateContactSchedule implements Schedulable {
    global void execute(SchedulableContext sc) {
        Database.executeBatch(new UpdateContactBatch());
    }
}