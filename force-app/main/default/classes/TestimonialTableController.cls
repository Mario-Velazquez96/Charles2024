public without sharing class TestimonialTableController {
  @AuraEnabled(cacheable=true)
  public static List<TestimonialWrapper> getTestimonials() {
    List<Testimonial__c> testimonials = [
      SELECT Id, Name, Testimonial_Text__c, Testimonial_Date__c
      FROM Testimonial__c
      ORDER BY Testimonial_Date__c DESC NULLS LAST
      LIMIT 50000
    ];
    List<TestimonialWrapper> wrappedTestimonials = new List<TestimonialWrapper>();
    for (Testimonial__c t : testimonials) {
      TestimonialWrapper wrapper = new TestimonialWrapper();
      wrapper.recordLink = '/' + t.Id;
      wrapper.Name = t.Name;
      wrapper.TestimonialText = t.Testimonial_Text__c;
      wrapper.TestimonialDate = t.Testimonial_Date__c;
      wrappedTestimonials.add(wrapper);
    }
    return wrappedTestimonials;
  }

  @AuraEnabled(cacheable=true)
  public static List<TestimonialWrapper> getFilterTestimonials(
    Date startDate,
    Date endDate
  ) {
    List<Testimonial__c> testimonials = new List<Testimonial__c>();
    List<TestimonialWrapper> wrappedTestimonials = new List<TestimonialWrapper>();

    String query = 'SELECT Id, Name, Testimonial_Text__c, Testimonial_Date__c FROM Testimonial__c';
    if (startDate != null && endDate != null) {
      query += ' WHERE Testimonial_Date__c >= :startDate AND Testimonial_Date__c <= :endDate';
    } else if (startDate != null && endDate == null) {
      query += ' WHERE Testimonial_Date__c >= :startDate';
    } else if (startDate == null && endDate != null) {
      query += ' WHERE Testimonial_Date__c <= :endDate';
    }
    query += ' ORDER BY Testimonial_Date__c DESC LIMIT 50000';
    testimonials = Database.query(query);

    for (Testimonial__c t : testimonials) {
      TestimonialWrapper wrapper = new TestimonialWrapper();
      wrapper.recordLink = '/' + t.Id;
      wrapper.Name = t.Name;
      wrapper.TestimonialText = t.Testimonial_Text__c;
      wrapper.TestimonialDate = t.Testimonial_Date__c;
      wrappedTestimonials.add(wrapper);
    }
    return wrappedTestimonials;
  }

  public class TestimonialWrapper {
    @AuraEnabled
    public String recordLink { get; set; }
    @AuraEnabled
    public String Name { get; set; }
    @AuraEnabled
    public String TestimonialText { get; set; }
    @AuraEnabled
    public Date TestimonialDate { get; set; }
  }
}