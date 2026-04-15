import { useEffect, useState } from "react";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");

    const [priority, setPriority] = useState("Medium");
    const [dueDate, setDueDate] = useState("");
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    // 🔄 Fetch tasks
    const fetchTasks = async () => {
        setLoading(true);

        let query = `?search=${search}`;

        if (filter === "completed") query += "&status=completed";
        if (filter === "pending") query += "&status=pending";

        if (filter === "high") query += "&priority=High";
        if (filter === "medium") query += "&priority=Medium";
        if (filter === "low") query += "&priority=Low";

        const res = await fetch(`https://task-manager-app-zrrp.onrender.com/tasks${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setTasks(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [filter, search]);

    // ➕ Add task
    const addTask = async () => {
        if (!title) return;

        const tempTask = {
            id: Date.now(),
            title,
            completed: false,
            priority,
            due_date: dueDate,
        };

        setTasks((prev) => [tempTask, ...prev]);

        await fetch("https://task-manager-app-zrrp.onrender.com/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title,
                description: "",
                priority,
                due_date: dueDate || null,
            }),
        });

        setTitle("");
        setPriority("Medium");
        setDueDate("");

        fetchTasks();
    };

    // ✅ Toggle complete
    const toggleComplete = async (task) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === task.id ? { ...t, completed: !t.completed } : t
            )
        );

        await fetch(`https://task-manager-app-zrrp.onrender.com/tasks/${task.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ completed: !task.completed }),
        });
    };

    // ❌ Delete task
    const deleteTask = async (id) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));

        await fetch(`https://task-manager-app-zrrp.onrender.com/tasks/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6">

                <h1 className="text-2xl font-bold mb-4 text-center">
                    Task Manager 🚀
                </h1>

                {/* 🔍 SEARCH */}
                <input
                    className="border p-2 rounded w-full mb-4"
                    placeholder="Search tasks..."
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* ➕ ADD TASK */}
                <div className="flex flex-col gap-3 mb-4">
                    <input
                        className="border p-2 rounded"
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="flex gap-2">
                        <select
                            className="border p-2 rounded"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>

                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={!title}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        onClick={addTask}
                    >
                        Add Task
                    </button>
                </div>

                {/* 🎯 PREMIUM FILTER BAR */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center bg-gray-100 p-2 rounded-xl">

                    {[
                        { key: "all", label: "All" },
                        { key: "completed", label: "Completed" },
                        { key: "pending", label: "Pending" },
                        { key: "low", label: "Low" },
                        { key: "medium", label: "Medium" },
                        { key: "high", label: "High" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                filter === f.key
                                    ? "bg-white text-blue-600 shadow-md scale-105"
                                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}

                </div>

                {/* 👀 CURRENT VIEW */}
                <p className="text-center text-sm text-gray-500 mb-3">
                    Showing <span className="font-semibold text-blue-600 capitalize">{filter}</span> tasks
                </p>

                {/* ⏳ LOADING */}
                {loading && <p className="text-center">Loading...</p>}

                {/* 📭 EMPTY */}
                {!loading && tasks.length === 0 && (
                    <p className="text-center text-gray-500">No tasks found</p>
                )}

                {/* 📋 TASK LIST */}
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm"
                        >
                            <div>
                                <p className={`${task.completed ? "line-through text-gray-400" : ""}`}>
                                    {task.title}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {task.priority} |{" "}
                                    {task.due_date
                                        ? task.due_date.split("T")[0]
                                        : "No due date"}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleComplete(task)}
                                    className={`px-3 py-1 text-white rounded ${
                                        task.completed
                                            ? "bg-yellow-500 hover:bg-yellow-600"
                                            : "bg-green-500 hover:bg-green-600"
                                    }`}
                                >
                                    {task.completed ? "Undo" : "Complete"}
                                </button>

                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default Dashboard;