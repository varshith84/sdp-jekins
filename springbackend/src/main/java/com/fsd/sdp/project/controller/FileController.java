package com.fsd.sdp.project.controller;

import java.io.IOException;
import java.util.List;

import com.fsd.sdp.project.model.FileDTO;
import com.fsd.sdp.project.model.FileEntity;
import com.fsd.sdp.project.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;



@CrossOrigin("http://localhost:9090/")
@RestController
@RequestMapping("/api/file")
public class FileController {
    @Autowired
    private FileService service;

    @PostMapping("/upload/{userId}")
    public String upload(@PathVariable int userId, @RequestParam("file") MultipartFile f) throws IOException {
        service.addFile(userId, f);
        return "Uploaded";
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        FileEntity fileEntity = service.getFile(id);

        if (fileEntity != null) {
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileEntity.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileEntity.getFileName() + "\"")
                .body(fileEntity.getData());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/viewall/{username}")
    public ResponseEntity<List<FileDTO>> viewUserFiles(@PathVariable String username) {
        try {
            List<FileDTO> files = service.getUserFiles(username);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
