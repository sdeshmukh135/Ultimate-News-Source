import "../styles/AuthForm.css";

const AuthForm = (props) => {
  return (
    <>
      <form className="login-form" onSubmit={props.handleSubmit}>
        <label htmlFor="username">Username: </label>
        <input
          type="text"
          name="username"
          value={props.formData.username}
          onChange={props.handleChange}
          required
        />
        <label htmlFor="password">Password: </label>
        <input
          type="password"
          name="password"
          value={props.formData.password}
          onChange={props.handleChange}
          required
        />

        {props.footer}
      </form>
    </>
  );
};

export default AuthForm;
