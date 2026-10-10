package com.carbontrust.backend.repository;
import com.carbontrust.backend.entity.SecurityLock;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
public interface SecurityLockRepository extends JpaRepository<SecurityLock,Long> {
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select l from SecurityLock l where l.id=1")
 SecurityLock acquire();
}
