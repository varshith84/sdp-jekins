package com.fsd.sdp.project.repository;

import com.fsd.sdp.project.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Session findByPasskey(String passkey);
}