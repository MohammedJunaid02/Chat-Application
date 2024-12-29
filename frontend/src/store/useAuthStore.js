import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn:  false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth : async() => 
    {
        try 
        {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
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
           toast.success("Logged in successfully",{
            ariaProps: {
                role: 'status',
                'aria-live': 'polite',
              },
           });
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
                console.log(`Previous authUser:`, state.authUser); // Debugging current state
                console.log(`Response data:`, res.data); // Debugging API response
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
    }
    
}))


