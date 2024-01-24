@isTest
public class TestimonialTableControllerTest {
  @TestSetup
  static void makeData() {
    Account testAccount = new Account(Name = 'Testi Account');
    insert testAccount;
  }

  @isTest
  private static void getTestimonialsTest() {
    List<Testimonial__c> testData = createTestimonials(5);
    insert testData;

    Test.startTest();
    List<TestimonialTableController.TestimonialWrapper> results = TestimonialTableController.getTestimonials();
    Test.stopTest();

    Assert.areEqual(
      5,
      results.size(),
      'Should return correct number of testimonials'
    );
  }

  @isTest
  private static void testGetFilterTestimonials() {
    List<Testimonial__c> testData = createTestimonials(10);
    insert testData;

    Date startDate = Date.today().addDays(-9);
    Date endDate = Date.today();

    // Test getFilterTestimonials method
    Test.startTest();
    List<TestimonialTableController.TestimonialWrapper> results = TestimonialTableController.getFilterTestimonials(
      startDate,
      endDate
    );
    Test.stopTest();

    // Assertions
    Assert.areEqual(
      10,
      results.size(),
      'Should return correct number of testimonials within date range'
    );
  }

  // Utility method to create test data
  private static List<Testimonial__c> createTestimonials(Integer count) {
    Account acc = [SELECT Id FROM Account WHERE Name = 'Testi Account'];
    List<Testimonial__c> testimonials = new List<Testimonial__c>();
    for (Integer i = 0; i < count; i++) {
      testimonials.add(
        new Testimonial__c(
          Account__c = acc.Id,
          Name = 'Testimonial ' + i,
          Testimonial_Text__c = 'Testimonial Text ' + i,
          Testimonial_Date__c = Date.today().addDays(-i)
        )
      );
    }
    return testimonials;
  }
}