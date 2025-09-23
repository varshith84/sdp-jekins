package com.fsd.sdp.project.service;


import com.fsd.sdp.project.model.FileDTO;
import com.fsd.sdp.project.model.FileEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileService {
    FileEntity addFile(int userId, MultipartFile file) throws IOException;
    FileEntity getFile(Long id);
    List<FileDTO> getUserFiles(String username);
    String delete(Long id);
}