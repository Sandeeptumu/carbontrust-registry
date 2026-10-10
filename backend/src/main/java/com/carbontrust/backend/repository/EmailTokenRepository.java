package com.carbontrust.backend.repository;
import com.carbontrust.backend.entity.EmailToken;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface EmailTokenRepository extends JpaRepository<EmailToken,String> {
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select t from EmailToken t where t.tokenHash=:hash")
 Optional<EmailToken> lockByHash(String hash);
 @Query("select t.user.userId from EmailToken t where t.tokenHash=:hash")
 Optional<Long> findUserIdByHash(String hash);
 void deleteByUserUserId(Long id);
 void deleteByUserUserIdAndPurpose(Long id,String purpose);
}
