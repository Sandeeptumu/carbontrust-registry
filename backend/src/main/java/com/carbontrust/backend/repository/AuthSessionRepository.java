package com.carbontrust.backend.repository;
import com.carbontrust.backend.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuthSessionRepository extends JpaRepository<AuthSession,String> {
 void deleteByUserUserId(Long id);
}
