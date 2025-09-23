package com.fsd.sdp.project;

import com.fsd.sdp.project.model.SharedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SharedFileRepository extends JpaRepository<SharedFile, Long> {
    Optional<SharedFile> findByShareToken(String token);
}
