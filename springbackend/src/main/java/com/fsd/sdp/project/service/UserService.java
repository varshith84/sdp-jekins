package com.fsd.sdp.project.service;

import com.fsd.sdp.project.model.FileDTO;
import com.fsd.sdp.project.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    String adduser(User u);
    String update(User u);
    String delete(int id);
    List<User> viewall();
    User viewbyid(int id);
    User loginUser(User user);
    User getUserByUsername(String username);
    String updateFavouriteStatus(Long fileId, Boolean isFavourite);
    List<FileDTO> getFavouriteFiles(String username);
    boolean usernameExists(String username);
    boolean emailExists(String email);
    String updateProfilePicture(int userId, MultipartFile profilePicture);
    byte[] getProfilePicture(int userId);
    String deleteUser(int adminId, int userId);
}