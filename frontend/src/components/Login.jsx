import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // to navigate to the Home Page
  const { setUser } = useUser();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        setMessage({ type: "success", text: "Login successful!" });
        setUser(data); // Set the user in context with id and username
        navigate("/news"); // Redirect to the homepage
      } else {
        setMessage({ type: "error", text: data.error || "Login failed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label htmlFor="username">Username: </label>
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <label htmlFor="password">Password: </label>
      <input
        type="text"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button type="submit">Log In</button>

      {message && <p className={`message ${message.type}`}>{message.text}</p>}
    </form>
  );
};

export default Login;
