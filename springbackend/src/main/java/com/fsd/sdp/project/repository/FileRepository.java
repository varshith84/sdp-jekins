package com.fsd.sdp.project.repository;

import com.fsd.sdp.project.model.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUserId(int userId);
    List<FileEntity> findByUserIdAndIsFavouriteTrue(int userId);
    List<FileEntity> findBySessionId(Long sessionId);
}