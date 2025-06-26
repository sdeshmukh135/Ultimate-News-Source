import { useState } from "react";
import AuthForm from "./AuthForm.jsx";

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
      console.log(data);

      if (response.ok) {
        setOutputMessage({
          type: "success",
          text: data.message,
        });
      } else {
        setOutputMessage({
          type: "error",
          text: data.error,
        });
      }
    } catch (error) {
      console.log("error: ", error);
      setOutputMessage({
        type: "error",
        text: data.error,
      });
    }
  };

  return (
    <AuthForm
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      message={outputMessage}
      formData={formInput}
      type="Sign Up"
    />
  );
};

export default SignUp;
