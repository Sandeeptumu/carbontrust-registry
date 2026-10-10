package com.carbontrust.backend;
import com.carbontrust.backend.dto.ProjectRequest;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class ProjectValidationTests {
 @Test void invalidAreasAndOversizeMetadataAreRejected() {
  var validator=Validation.buildDefaultValidatorFactory().getValidator();
  var r=new ProjectRequest();r.setProjectName("Forest");r.setEcosystemType("Mangrove");r.setLocation("Coast");r.setStartDate(java.time.LocalDate.now());r.setArea(-1.0);
  assertFalse(validator.validate(r).isEmpty());
  r.setArea(Double.POSITIVE_INFINITY);assertFalse(validator.validate(r).isEmpty());
  r.setArea(1.0);r.setDescription("x".repeat(2001));assertFalse(validator.validate(r).isEmpty());
  r.setDescription("Valid metadata");assertTrue(validator.validate(r).isEmpty());
 }
}
