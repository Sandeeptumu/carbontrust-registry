package com.carbontrust.backend.service;
import com.carbontrust.backend.dto.*;
import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test")
class MrvPersistenceTests {
 @Autowired UserRepository users;
 @Autowired ProjectRepository projects;
 @Autowired MRVSubmissionRepository submissions;
 @Autowired VerificationRepository reviews;
 @Autowired MRVSubmissionService mrv;
 @Autowired VerificationService verification;
 @Autowired PlatformTransactionManager transactions;
 private User user(String email,String role) { var u=new User();u.setEmail(email);u.setUsername(email);u.setRole(role);u.setStatus(true);return users.save(u); }
 @Test void fileAssignmentDecisionAndHistorySurviveTransactionBoundaries() {
   Long projectId = new TransactionTemplate(transactions).execute(t->{
    var owner=user("mrv-owner@test.invalid","NGO");user("mrv-admin@test.invalid","ADMIN");user("mrv-verifier@test.invalid","VERIFIER");
    var p=new Project();p.setOwner(owner);p.setProjectName("Isolated evidence fixture");p.setProjectStatus("DRAFT");return projects.save(p).getProjectId();
   });
   try {
    var request=new MRVSubmissionRequest();request.setPhotoVerification(false);request.setRemarks("Persisted report");
    byte[] data="%PDF-1.4\nPersisted fixture".getBytes();
    var created=mrv.createMRVSubmission(projectId,request,new MockMultipartFile("file","report.pdf","application/pdf",data),"mrv-owner@test.invalid");
    assertArrayEquals(data,mrv.evidence(created.getMrvId(),"mrv-owner@test.invalid").getEvidence());
    var assigned=mrv.assign(created.getMrvId(),users.findByEmail("mrv-verifier@test.invalid").orElseThrow().getUserId(),"mrv-admin@test.invalid");
    assertEquals(1,mrv.getAllSubmissions("PENDING","mrv-verifier@test.invalid").size());
    var decision=new VerificationRequest();decision.setComments("Reviewed stored report");decision.setVerificationStatus("APPROVED");
    verification.verifyMRV(created.getMrvId(),decision,"mrv-verifier@test.invalid");
    assertEquals("APPROVED",mrv.getProjectMRVSubmissions(projectId,"mrv-owner@test.invalid").get(0).getMrvStatus());
    assertEquals("Reviewed stored report",verification.getMRVVerifications(created.getMrvId(),"mrv-owner@test.invalid").get(0).getComments());
    assertEquals("VERIFIED",projects.findById(projectId).orElseThrow().getProjectStatus());
   } finally {
    new TransactionTemplate(transactions).executeWithoutResult(t->{
     for(var s:submissions.findByProjectProjectId(projectId)){ reviews.deleteAll(reviews.findByMrvSubmissionMrvId(s.getMrvId()));submissions.delete(s); }
     projects.deleteById(projectId);
     for(String email:new String[]{"mrv-owner@test.invalid","mrv-admin@test.invalid","mrv-verifier@test.invalid"}) users.delete(users.findByEmail(email).orElseThrow());
    });
   }
 }
}
