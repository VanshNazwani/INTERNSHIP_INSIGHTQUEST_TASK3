import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) navigate("/");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProjects();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/projects",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container">
      <h2>Project Dashboard</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Create Project</button>
      </form>

      <h3 style={{ marginTop: "25px" }}>Your Projects</h3>
      <ul>
        {projects.map((p) => (
          <li key={p._id}>
            <strong>{p.name}</strong>
            <br />
            <small>{p.description}</small>
          </li>
        ))}
      </ul>

      <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} style={{ background: "#dc3545", marginTop: "15px" }}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
