import { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [formInput, setFormInput] = useState({ username: "", password: "" });
  const [outputMessage, setOutputMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    // change the value of either the username or password of the formInput
    setFormInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formInput),
      });

      const data = await response.json();

      if (response.ok) {
        setOutputMessage({
          type: "success",
          text: "Signup successful! Please Login",
        });
      } else {
        setOutputMessage({
          type: "error",
          text: data.error || "Signup failed.",
        });
      }
    } catch (error) {
      console.log("error: ", error);
      setOutputMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    }
  };

  return (
    <form className="signupform" onSubmit={handleSubmit}>
      <label htmlFor="username">Username: </label>
      <input
        type="text"
        id="username"
        name="username"
        value={formInput.username}
        onChange={handleChange}
      />
      <label htmlFor="password">Password: </label>
      <input
        type="text"
        id="password"
        name="password"
        value={formInput.password}
        onChange={handleChange}
      />
      <div className="formButtons">
        <button type="submit">Sign Up</button>
        <Link to="/">
          <button type="button">Have an Account? Login In</button>
        </Link>
      </div>
      {outputMessage && (
        <div className={`message ${outputMessage.type}`}>
          {outputMessage.text}
        </div>
      )}
    </form>
  );
};

export default SignUp;
