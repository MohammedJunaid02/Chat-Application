import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";


export const useAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn:  false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null, 
    onlineUsers: [],

    checkAuth : async() => 
    {
        try 
        {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
            get().connectSocket();
        } 
        catch (error) 
        {
            console.log("Error in checkAuth : ",error);
            set({authUser: null});
        }
        finally
        {
            set({isCheckingAuth: false});
        }
    },

    signup: async (data) => 
    {
        try 
        {
            set({ isSigningUp: true });
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } 
        catch (error) 
        {
            console.error("Signup error:", error.response?.data || error); // Debug error
            toast.error(error.response?.data?.message || "Signup failed");
        } 
        finally 
        {
            set({ isSigningUp: false });
            console.log("Signup process completed.");
        }
    },

    login : async (data) => 
    {
        try 
        {
           set( {  isLoggingIn : true });     
           const res = await axiosInstance.post("/auth/login",data);
           set({ authUser: res.data });
           toast.success("Logged in successfully");
           get().connectSocket();
        } 
        catch (error) 
        {
            console.error("Signin error:", error.response?.data || error); // Debug error
            toast.error(error.response?.data?.message || "Signin failed");
        }
        finally
        {
            set({ isLoggingIn : false });
        }
    },

    logout : async () => 
    {
        try 
        {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } 
        catch (error) 
        {
            console.log(`error: ${error}`);
            toast.error(error.response.data.message || "Something went wrong with your logout");
        }

    },

    updateProfile : async (data) => 
    {
        try 
        {
            set({ isUpdatingProfile: true });
            const res = await axiosInstance.put("/auth/update-profile", data);
            set((state) => {
                return {
                    authUser: { ...state.authUser, ...res.data },
                };
            });
            toast.success("Profile updated successfully");
        } 
        catch (error) 
        {
            console.log(`error: ${error}`);
            toast.error(error.response.data.message || "Something went wrong while uploading the image");
        }
        finally
        {
            set({isUpdatingProfile : false});
        }
    },
    
    connectSocket : () =>  
    {
        const { authUser } = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL,{
            query : {
                userId : authUser._id,
            }
        });
        socket.connect()
        set({ socket: socket});

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers : userIds });
        })
    },
    
    disconnectSocket : () =>  
    {
        if(get()?.socket?.connected) get().socket.disconnect();
    },


    
}))


