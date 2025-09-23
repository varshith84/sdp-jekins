package com.fsd.sdp.project.service;

import com.fsd.sdp.project.model.FileDTO;
import com.fsd.sdp.project.model.Group;
import com.fsd.sdp.project.model.Message;

import java.util.List;

public interface GroupService {
    Group createGroup(String name, String password, String creatorUsername);
    Group joinGroup(String groupId, String password, String username);
    String leaveGroup(String groupId, String username);
    List<Group> getUserGroups(String username);
    Message sendMessage(String groupId, String senderUsername, String content, String type);
    List<Message> getGroupMessages(String groupId);
    List<FileDTO> getSharedFiles(String username);
    void broadcastMessage(String groupId, Message message);
    List<Group> viewAllGroups();
    String deleteGroup(Long adminId, String groupId);
}