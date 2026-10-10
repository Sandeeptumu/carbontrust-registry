package com.carbontrust.backend.service;
import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.repository.*;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class MarketplacePrivacyTests {
 @Test void draftProjectIsNotExposedThroughMarketplace() {
  var projects=mock(ProjectRepository.class);var batches=mock(CarbonCreditBatchRepository.class);
  var user=new User();user.setUserId(1L);user.setUsername("owner");
  var p=new Project();p.setProjectId(2L);p.setProjectName("Private draft");p.setOwner(user);p.setProjectStatus("DRAFT");
  when(projects.findById(2L)).thenReturn(Optional.of(p));
  var service=new ProjectService(projects,mock(UserRepository.class),mock(MRVSubmissionRepository.class),batches);
  assertThrows(ResourceNotFoundException.class,() -> service.getMarketplaceProject(2L));
  when(batches.existsByProjectProjectId(2L)).thenReturn(true);
  assertEquals("Private draft",service.getMarketplaceProject(2L).getProjectName());
 }
}
