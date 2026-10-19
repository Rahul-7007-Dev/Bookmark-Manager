import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5001/api/bookmarks";

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookmarks = async () => {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarks");
      }

      setBookmarks(await response.json());
    } catch {
      setError("Could not load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, url }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (isEditing) {
        setBookmarks((current) =>
          current.map((bookmark) =>
            bookmark._id === editingId ? data : bookmark,
          ),
        );
      } else {
        setBookmarks((current) => [data, ...current]);
      }

      resetForm();
    } catch (error) {
      setError(error.message || "Something went wrong.");
    }
  };

  const startEditing = (bookmark) => {
    setEditingId(bookmark._id);
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setEditingId(null);
  };

  const deleteBookmark = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete bookmark");
      }

      setBookmarks((current) =>
        current.filter((bookmark) => bookmark._id !== id),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setError(error.message || "Could not delete bookmark.");
    }
  };

  return (
    <main className="container">
      <h1>Bookmark Manager</h1>
      <p className="subtitle">Save your favorite websites in one place.</p>

      <form className="bookmark-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Website title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
        />

        <button type="submit">
          {editingId ? "Update Bookmark" : "Add Bookmark"}
        </button>

        {editingId && (
          <button type="button" className="cancel-button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      <h2>Your Bookmarks ({bookmarks.length})</h2>

      {loading ? (
        <p>Loading bookmarks...</p>
      ) : bookmarks.length === 0 ? (
        <p>No bookmarks yet. Add your first one!</p>
      ) : (
        <ul className="bookmark-list">
          {bookmarks.map((bookmark) => (
            <li key={bookmark._id} className="bookmark-item">
              <div>
                <h3>{bookmark.title}</h3>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bookmark.url}
                </a>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => startEditing(bookmark)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteBookmark(bookmark._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
