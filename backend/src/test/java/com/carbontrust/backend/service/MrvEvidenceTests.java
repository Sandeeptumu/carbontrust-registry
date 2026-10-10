package com.carbontrust.backend.service;
import com.carbontrust.backend.dto.*;
import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.repository.*;
import com.carbontrust.backend.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Optional;

class MrvEvidenceTests {
 @Test void validatesSignatureAndPreservesBytesAndDigest() {
   var m = new MRVSubmission(); byte[] pdf = "%PDF-1.4\nregistry evidence".getBytes();
   MRVSubmissionService.storeEvidence(m, new MockMultipartFile("file","report.pdf","application/pdf",pdf));
   assertArrayEquals(pdf,m.getEvidence()); assertEquals(64,m.getSha256().length()); assertEquals((long)pdf.length,m.getFileSize());
 }
 @Test void rejectsDisguisedFileAndOversizeAndEmpty() {
   assertThrows(BusinessException.class,()->MRVSubmissionService.storeEvidence(new MRVSubmission(),new MockMultipartFile("file","evil.pdf","application/pdf","<script>".getBytes())));
   assertThrows(BusinessException.class,()->MRVSubmissionService.storeEvidence(new MRVSubmission(),new MockMultipartFile("file","large.pdf","application/pdf",new byte[10*1024*1024+1])));
   assertThrows(BusinessException.class,()->MRVSubmissionService.storeEvidence(new MRVSubmission(),new MockMultipartFile("file","empty.pdf","application/pdf",new byte[0])));
 }
 @Test void unassignedVerifierCannotDownloadEvidence() {
   var mr=mock(MRVSubmissionRepository.class); var ur=mock(UserRepository.class); var pr=mock(ProjectRepository.class);
   var user=new User(); user.setUserId(7L); user.setRole("VERIFIER"); user.setStatus(true);
   when(ur.findByEmail("v@example.com")).thenReturn(Optional.of(user));
   var m=new MRVSubmission(); var p=new Project(); var owner=new User(); owner.setUserId(3L); p.setOwner(owner); m.setProject(p);
   when(mr.findById(1L)).thenReturn(Optional.of(m));
   assertThrows(AccessDeniedException.class,()->new MRVSubmissionService(mr,pr,ur).evidence(1L,"v@example.com"));
 }
 @Test void assignedVerifierDecisionPersistsReviewAndState() {
   var mr=mock(MRVSubmissionRepository.class); var ur=mock(UserRepository.class); var pr=mock(ProjectRepository.class); var vr=mock(VerificationRepository.class);
   var user=new User(); user.setUserId(7L); user.setRole("VERIFIER"); user.setStatus(true);
   when(ur.findByEmail("v@example.com")).thenReturn(Optional.of(user));
   var m=new MRVSubmission(); m.setMrvId(1L); m.setMrvStatus("PENDING"); m.setAssignedVerifier(user); var p=new Project(); p.setProjectId(2L); m.setProject(p);
   when(mr.findLockedById(1L)).thenReturn(Optional.of(m)); when(pr.findLockedById(2L)).thenReturn(Optional.of(p)); when(vr.save(any())).thenAnswer(i->i.getArgument(0));
   var request=new VerificationRequest(); request.setComments("Evidence reviewed"); request.setVerificationStatus("APPROVED");
   var response = new VerificationService(vr,mr,ur,pr).verifyMRV(1L,request,"v@example.com");
   assertEquals("APPROVED",response.getVerificationStatus()); assertEquals("Evidence reviewed",response.getComments()); assertEquals("VERIFIED",p.getProjectStatus()); assertEquals("APPROVED",m.getMrvStatus());
   assertThrows(BusinessException.class,()->new VerificationService(vr,mr,ur,pr).verifyMRV(1L,request,"v@example.com"));
 }
 @Test void unassignedVerifierCannotDecide() {
   var mr=mock(MRVSubmissionRepository.class); var ur=mock(UserRepository.class); var pr=mock(ProjectRepository.class); var vr=mock(VerificationRepository.class);
   var user=new User(); user.setUserId(7L); user.setRole("VERIFIER"); user.setStatus(true); when(ur.findByEmail("v@example.com")).thenReturn(Optional.of(user));
   var m=new MRVSubmission(); m.setMrvStatus("PENDING"); when(mr.findLockedById(1L)).thenReturn(Optional.of(m));
   var r=new VerificationRequest(); r.setComments("Reviewed"); r.setVerificationStatus("APPROVED");
   assertThrows(AccessDeniedException.class,()->new VerificationService(vr,mr,ur,pr).verifyMRV(1L,r,"v@example.com")); verify(vr,never()).save(any());
 }
}
