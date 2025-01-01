import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

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

    subscribeToMessages : () => 
    {
        const { selectedUser } = get()
        if(!selectedUser) return;
        
        const socket = useAuthStore.getState().socket;

        
        socket.on("newMessage", (newMessage) => {
            // if(newMessage.senderId !== selectedUser._id) return;

            // the above code is same as below one and is given below just for undesratnading purposes
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id ;

            if(!isMessageSentFromSelectedUser) return;

            set({
                messages : [...get().messages, newMessage],
            })
        })

    },

    unsubscribeFromMessages : () =>
    {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
