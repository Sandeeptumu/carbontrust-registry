package com.carbontrust.backend.service;
import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
class ProjectCreditAccessTests {
 @Test void onlyActiveOwnerNgoOrAdminCanReadProjectCredits() {
  var users=mock(UserRepository.class); var projects=mock(ProjectRepository.class); var credits=mock(CarbonCreditBatchRepository.class);
  var owner=new User(); owner.setUserId(1L); owner.setRole("NGO"); owner.setStatus(true);
  var other=new User(); other.setUserId(2L); other.setRole("NGO"); other.setStatus(true);
  var admin=new User(); admin.setUserId(3L); admin.setRole("ADMIN"); admin.setStatus(true);
  var project=new Project(); project.setOwner(owner); when(projects.findById(9L)).thenReturn(Optional.of(project));
  when(users.findByEmail("owner")).thenReturn(Optional.of(owner)); when(users.findByEmail("other")).thenReturn(Optional.of(other)); when(users.findByEmail("admin")).thenReturn(Optional.of(admin));
  var service=new CarbonCreditBatchService(credits,projects,users);
  assertThrows(AccessDeniedException.class,()->service.getProjectCredits(9L,"other"));
  verify(credits,never()).findByProjectProjectId(any());
  assertEquals(List.of(),service.getProjectCredits(9L,"owner"));
  assertEquals(List.of(),service.getProjectCredits(9L,"admin"));
  owner.setRole("USER"); assertThrows(AccessDeniedException.class,()->service.getProjectCredits(9L,"owner"));
  admin.setStatus(false); assertThrows(AccessDeniedException.class,()->service.getProjectCredits(9L,"admin"));
 }
}
