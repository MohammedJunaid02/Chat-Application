import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    onlineUsers:[],

    getUsers: async () => {
        try {
            set({ isUsersLoading: true });
            const res = await axiosInstance.get("/messages/users");
            set({ users : res.data.filteredUsers  });
        } catch (error) {
            console.error("Error fetching users:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Error fetching users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        try {
            set({ isMessagesLoading: true });
            const res = await axiosInstance.get(`/messages/${userId}`);
            const messages = Array.isArray(res.data) ? res.data : [];
            set({ messages });
        } catch (error) {
            console.error("Error fetching messages:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Error fetching messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage : async(messageData) =>
    {
        try 
        {
            const { selectedUser , messages } = get();
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData);
            set({messages : [...messages,res.data]});
        } 
        catch (error) 
        {
            console.error("Error sending messages:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Error sending messages");
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
