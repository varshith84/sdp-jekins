package com.fsd.sdp.project.service;

import com.fsd.sdp.project.model.FileDTO;
import com.fsd.sdp.project.model.User;
import com.fsd.sdp.project.repository.FileRepository;
import com.fsd.sdp.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Override
    public String adduser(User u) {
        if (usernameExists(u.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (emailExists(u.getEmail())) {
            throw new RuntimeException("Email already taken");
        }
        User savedUser = userRepository.save(u);
        return "User added successfully with ID: " + savedUser.getId();
    }

    @Override
    public String update(User u) {
        return userRepository.findById(u.getId())
                .map(user -> {
                    user.setUsername(u.getUsername());
                    user.setEmail(u.getEmail());
                    user.setPassword(u.getPassword());
                    user.setAdmin(u.isAdmin());
                    userRepository.save(user);
                    return "Updated Successfully";
                })
                .orElse("Cannot Update");
    }

    @Override
    public String delete(int id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return "Deleted Successfully";
                })
                .orElse("Cannot Delete");
    }

    @Override
    public List<User> viewall() {
        return userRepository.findAll();
    }

    @Override
    public User viewbyid(int id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User loginUser(User user) {
        User existingUser = null;
        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            existingUser = userRepository.findByUsername(user.getUsername());
        }
        if (existingUser == null && user.getEmail() != null && !user.getEmail().isEmpty()) {
            existingUser = userRepository.findByEmail(user.getEmail());
        }
        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            System.out.println("Login successful for user: " + existingUser.getUsername());
            return existingUser;
        }
        System.out.println("Login failed for user: " + user.getUsername() + " or email: " + user.getEmail());
        throw new RuntimeException("Invalid credentials");
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public String updateFavouriteStatus(Long fileId, Boolean isFavourite) {
        return fileRepository.findById(fileId)
                .map(file -> {
                    file.setIsFavourite(isFavourite);
                    fileRepository.save(file);
                    return "Favourite status updated";
                })
                .orElse("Cannot update favourite status");
    }

    @Override
    public List<FileDTO> getFavouriteFiles(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }
        return fileRepository.findByUserIdAndIsFavouriteTrue(user.getId())
                .stream()
                .map(FileDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public boolean usernameExists(String username) {
        return userRepository.findByUsername(username) != null;
    }

    @Override
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }

    @Override
    public String updateProfilePicture(int userId, MultipartFile profilePicture) {
        return userRepository.findById(userId)
                .map(user -> {
                    try {
                        user.setProfilePicture(profilePicture.getBytes());
                        user.setProfilePictureType(profilePicture.getContentType());
                        userRepository.save(user);
                        return "Profile picture updated successfully";
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to upload profile picture: " + e.getMessage());
                    }
                })
                .orElse("User not found");
    }

    @Override
    public byte[] getProfilePicture(int userId) {
        return userRepository.findById(userId)
                .map(User::getProfilePicture)
                .orElse(null);
    }

    @Override
    public String deleteUser(int adminId, int userId) {
        return userRepository.findById(adminId)
                .map(admin -> {
                    if (!admin.isAdmin()) {
                        throw new RuntimeException("Unauthorized: Only admins can delete users");
                    }
                    return userRepository.findById(userId)
                            .map(user -> {
                                userRepository.delete(user);
                                return "User deleted successfully";
                            })
                            .orElse("User not found");
                })
                .orElse("Admin not found");
    }
}