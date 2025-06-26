import { Link } from "react-router-dom";

const AuthForm = (props) => {
  return (
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

      {props.type === "Log In" ? (
        <>
          <button type="submit">{props.type}</button>

          {props.message && (
            <p className={`message ${props.message.type}`}>
              {props.message.text}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="formButtons">
            <button type="submit">{props.type}</button>
            <Link to="/">
              <button type="button">Have an Account? Login In</button>
            </Link>
          </div>
          {props.message && (
            <div className={`message ${props.message.type}`}>
              {props.message.text}
            </div>
          )}
        </>
      )}
    </form>
  );
};

export default AuthForm;
