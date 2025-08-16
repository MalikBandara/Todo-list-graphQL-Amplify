import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { listTodos } from "./graphql/queries";
import { createTodo, updateTodo, deleteTodo } from "./graphql/mutations";
import { signOut } from "aws-amplify/auth";

const client = generateClient();

function App() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ taskName: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos with pagination
  const fetchTodos = async () => {
    let allTodos = [];
    let nextToken = null;

    try {
      do {
        const result = await client.graphql({
          query: listTodos,
          variables: { limit: 100, nextToken },
        });
        allTodos = allTodos.concat(result.data.listTodos.items);
        nextToken = result.data.listTodos.nextToken;
      } while (nextToken);

      setTodos(allTodos);
    } catch (err) {
      console.error(err);
    }
  };

  // Add / Update single todo
  const handleSubmit = async () => {
    if (!form.taskName) return alert("Task name is required!");
    try {
      if (editingId) {
        await client.graphql({
          query: updateTodo,
          variables: { input: { id: editingId, ...form } },
        });
        setEditingId(null);
      } else {
        await client.graphql({
          query: createTodo,
          variables: { input: form },
        });
      }
      setForm({ taskName: "", description: "" });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (todo) => {
    setForm({ taskName: todo.taskName, description: todo.description });
    setEditingId(todo.id);
  };

  const handleDelete = async (id) => {
    try {
      await client.graphql({
        query: deleteTodo,
        variables: { input: { id } },
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  // ⚡ Add 800 todos in batches
  const addMultipleTodos = async () => {
    const todosToAdd = [];
    for (let i = 1; i <= 800; i++) {
      todosToAdd.push({
        taskName: `Task ${i}`,
        description: `Description for task ${i}`,
      });
    }

    const BATCH_SIZE = 25; // 25 at a time to avoid rate limits

    for (let i = 0; i < todosToAdd.length; i += BATCH_SIZE) {
      const batch = todosToAdd.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((todo) =>
          client.graphql({
            query: createTodo,
            variables: { input: todo },
          })
        )
      );
    }

    console.log("All 800 todos added!");
    fetchTodos(); // Refresh UI
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">My Todo App</h1>
          <p className="text-gray-500 text-lg">Stay organized and productive</p>
          <div className="flex justify-center gap-4 mt-5">
            <button
              onClick={signOut}
              className="bg-red-400 px-4 py-2 rounded text-white"
            >
              Sign out
            </button>
            <button
              onClick={addMultipleTodos}
              className="bg-green-500 px-4 py-2 rounded text-white"
            >
              Add 800 Todos
            </button>
          </div>
        </div>

        {/* Add / Update Todo Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">
            {editingId ? "Update Todo" : "Add New Todo"}
          </h2>
          <input
            type="text"
            name="taskName"
            placeholder="Task name"
            value={form.taskName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded mb-4"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded mb-4"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 px-4 py-2 rounded text-white"
          >
            {editingId ? "Update Todo" : "Add Todo"}
          </button>
        </div>

        {/* Todos List */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">
            Your Tasks ({todos.length})
          </h2>
          <div className="space-y-4">
            {todos.map((todo, index) => (
              <div
                key={todo.id}
                className="p-4 border rounded flex justify-between"
              >
                <div>
                  <h3 className="font-semibold">{todo.taskName}</h3>
                  <p>{todo.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(todo)}
                    className="bg-yellow-400 px-2 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="bg-red-400 px-2 py-1 rounded text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
