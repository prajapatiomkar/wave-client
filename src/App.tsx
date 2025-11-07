import { useQuery } from "@tanstack/react-query";
import { healthCheck } from "./services/api";

export default function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["health"],
    queryFn: healthCheck,
  });
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Wave</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          {isLoading && <p>Connecting to server...</p>}
          {error && <p className="text-red-500">Failed to connect to server</p>}
          {data && <p className="text-green-500">Connected: {data.message}</p>}
        </div>
      </main>
    </div>
  );
}
