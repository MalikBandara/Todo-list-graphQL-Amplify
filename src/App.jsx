import { useEffect, useState } from "react";

import { generateClient } from "aws-amplify/api";

import { listTodos } from "./graphql/queries";
import { createTodo, updateTodo, deleteTodo } from "./graphql/mutations";
import { signOut } from "aws-amplify/auth";

const client = generateClient();

function App() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ taskName: "", description: "" });
  const [editingId, setEditingId] = useState(null); // track which todo we are editing

  useEffect(() => {
    fetchTodos();
  }, []);

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


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.taskName) return alert("Task name is required!");
    try {
      if (editingId) {
        // Update existing todo
        await client.graphql({
          query: updateTodo,
          variables: { input: { id: editingId, ...form } },
        });
        setEditingId(null);
      } else {
        // Create new todo
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            My Todo App
          </h1>
          <p className="text-gray-500 text-lg">Stay organized and productive</p>
          <button
            onClick={signOut}
            className="bg-red-400 px-4  py-2 rounded mt-5 text-white "
          >
            Sign out
          </button>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {editingId ? "✏️ Update Todo" : "➕ Add New Todo"}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                name="taskName"
                placeholder="What needs to be done?"
                value={form.taskName}
                onChange={handleChange}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 bg-white/50"
              />
            </div>

            <div className="relative">
              <textarea
                name="description"
                placeholder="Add a description (optional)"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 bg-white/50 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.taskName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {editingId ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Update Todo
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Todo
                  </>
                )}
              </span>
            </button>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({ taskName: "", description: "" });
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6 py-3 rounded-2xl transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Todos List */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-800">
                📋 Your Tasks
              </h2>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              {todos.length} {todos.length === 1 ? "task" : "tasks"}
            </div>
          </div>

          {todos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-gray-600 mb-2">
                All caught up! 🎉
              </h3>
              <p className="text-gray-400 text-lg">
                No tasks yet. Add your first todo above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className="group bg-gradient-to-r from-white to-gray-50/50 hover:from-blue-50 hover:to-purple-50 border-2 border-gray-100 hover:border-blue-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 leading-tight">
                        {todo.taskName}
                      </h3>
                      {todo.description && (
                        <p className="text-gray-600 text-base leading-relaxed">
                          {todo.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">All right reserved @malik</p>
        </div>
      </div>
    </div>
  );
}

export default App;
