package com.fsd.sdp.project.service;

import com.fsd.sdp.project.model.FileEntity;
import com.fsd.sdp.project.model.Session;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SessionService {
    Session createSession(String passkey, String creatorUsername);
    Session joinSession(String passkey, String username);
    FileEntity uploadFile(int userId, String passkey, MultipartFile file) throws IOException;
    List<FileEntity> getSessionFiles(String passkey);
}