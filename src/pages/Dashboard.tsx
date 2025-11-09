import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ChatRoom } from "../components/ChatRoom";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState("general");
  const [roomInput, setRoomInput] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomInput.trim()) {
      setCurrentRoom(roomInput.trim());
      setRoomInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat App</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-4">Rooms</h3>

              <form onSubmit={handleJoinRoom} className="mb-4">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="Enter room name"
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                  Join Room
                </button>
              </form>

              <div className="space-y-2">
                {["general", "random", "tech"].map((room) => (
                  <button
                    key={room}
                    onClick={() => setCurrentRoom(room)}
                    className={`w-full text-left px-3 py-2 rounded-md transition ${
                      currentRoom === room
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    # {room}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 h-[600px]">
            {/* Use currentRoom as key to force remount on room change */}
            <ChatRoom key={currentRoom} roomId={currentRoom} />
          </div>
        </div>
      </main>
    </div>
  );
};
