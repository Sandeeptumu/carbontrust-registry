package com.carbontrust.backend;
import com.carbontrust.backend.dto.*;
import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.repository.*;
import com.carbontrust.backend.service.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Optional;
class MrvRulesTest {
 @Test void decisionRequiresComments() {
 var vr=mock(VerificationRepository.class); var mr=mock(MRVSubmissionRepository.class); var ur=mock(UserRepository.class); var pr=mock(ProjectRepository.class);
 var user=new User(); user.setRole("VERIFIER"); user.setUserId(5L); user.setStatus(true);
 when(ur.findByEmail("v@test.com")).thenReturn(Optional.of(user));
 var m=new MRVSubmission(); m.setMrvStatus("PENDING"); m.setProject(new Project()); when(mr.findById(1L)).thenReturn(Optional.of(m));
 when(vr.save(any())).thenAnswer(i->i.getArgument(0));
 var request=new VerificationRequest(); request.setVerificationStatus("APPROVED"); request.setComments(" ");
 assertThrows(RuntimeException.class,()->new VerificationService(vr,mr,ur,pr).verifyMRV(1L,request,"v@test.com"));
 verify(vr,never()).save(any());
 }
}
