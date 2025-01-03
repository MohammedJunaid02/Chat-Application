import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"

const ChatHeader = () => {
  const { selectedUser , setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  
  return (
    <div className="p-[0.47rem] border border-b border-base-300 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
            {/* Avatar  */}
            <div className="avatar">
                <div className="size-10 rounded-full relative">
                    <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName}/>
                </div>
            </div>
            <span className="relative">
              {onlineUsers?.includes(selectedUser._id) && (
                <span
                className="absolute top-[0.65rem] right-[0.199rem] size-3 bg-green-500 
                rounded-full ring-2 ring-zinc-900"
                />
              )}
            </span>
          
            {/* User Info  */}
            <div>
                <h3 className="font-medium">{selectedUser.fullName}</h3>
                <p>
                    {onlineUsers?.includes(selectedUser._id) ? "Online" : "Offline"}
                </p>
            </div>
        </div>

        {/* Close button  */}
        <button onClick={() => setSelectedUser(null)}>
            <X/>
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
