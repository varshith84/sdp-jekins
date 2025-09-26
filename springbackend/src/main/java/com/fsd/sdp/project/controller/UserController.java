package com.fsd.sdp.project.controller;

import com.fsd.sdp.project.model.FileDTO;
import com.fsd.sdp.project.model.User;
import com.fsd.sdp.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin("http://localhost:9090/")
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<String> addUser(@RequestBody User user) {
        try {
            String result = userService.adduser(user);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Username already taken")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Username already taken");
            } else if (e.getMessage().equals("Email already taken")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Email already taken");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An error occurred during registration");
            }
        }
    }

    @PutMapping("/update")
    public String updateUser(@RequestBody User user) {
        return userService.update(user);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable int id) {
        return userService.delete(id);
    }

    @GetMapping("/viewall")
    public List<User> viewAllUsers() {
        return userService.viewall();
    }

    @GetMapping("/view/{id}")
    public User viewUserById(@PathVariable int id) {
        return userService.viewbyid(id);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            User loggedInUser = userService.loginUser(user);
            return ResponseEntity.ok(loggedInUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during login");
        }
    }

    @PutMapping("/file/favourite/{fileId}/{isFavourite}")
    public String updateFavouriteStatus(@PathVariable Long fileId, @PathVariable Boolean isFavourite) {
        return userService.updateFavouriteStatus(fileId, isFavourite);
    }

    @GetMapping("/file/favourites/{username}")
    public ResponseEntity<List<FileDTO>> getFavouriteFiles(@PathVariable String username) {
        try {
            List<FileDTO> files = userService.getFavouriteFiles(username);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping(value = "/update-profile-picture/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateProfilePicture(
            @PathVariable int userId,
            @RequestParam("profilePicture") MultipartFile profilePicture) {
        try {
            if (profilePicture.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Profile picture must be less than 5MB");
            }

            String contentType = profilePicture.getContentType();
            if (contentType != null && !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("File must be an image");
            }

            String result = userService.updateProfilePicture(userId, profilePicture);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update profile picture: " + e.getMessage());
        }
    }

    @GetMapping(value = "/profile-picture/{userId}")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable int userId) {
        User user = userService.viewbyid(userId);
        if (user == null || user.getProfilePicture() == null) {
            return ResponseEntity.notFound().build();
        }

        String contentType = user.getProfilePictureType() != null
                ? user.getProfilePictureType()
                : MediaType.IMAGE_JPEG_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(user.getProfilePicture());
    }

    @DeleteMapping("/admin/delete/{adminId}/{userId}")
    public ResponseEntity<String> deleteUserByAdmin(@PathVariable int adminId, @PathVariable int userId) {
        try {
            String result = userService.deleteUser(adminId, userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Unauthorized: Only admins can delete users")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            } else if (e.getMessage().equals("User not found") || e.getMessage().equals("Admin not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An error occurred while deleting the user");
            }
        }
    }
}
