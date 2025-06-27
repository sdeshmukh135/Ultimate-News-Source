import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import AuthForm from "./AuthForm.jsx";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState(""); // for error handling display
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
        setUser(data); // Set the user in context with id and username
        navigate("/news"); // Redirect to the homepage
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: data.error });
    }
  };

  const footer = (
    <>
      <button type="submit">Log In</button>

      {message && <p className={`message ${message.type}`}>{message.text}</p>}
    </>
  );

  return (
    <AuthForm
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      formData={formData}
      footer={footer}
    />
  );
};

export default Login;
