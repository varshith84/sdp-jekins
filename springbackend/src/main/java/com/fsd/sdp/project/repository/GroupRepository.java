package com.fsd.sdp.project.repository;

import com.fsd.sdp.project.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, String> {
    @Query("SELECT g FROM Group g JOIN g.usernames u WHERE u = :username")
    List<Group> findByUsernamesContaining(String username);
}