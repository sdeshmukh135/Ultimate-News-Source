import { useUser } from "../contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NavBar.css";

const NavBar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include", // Include credentials
      });

      if (response.ok) {
        setUser(null); // Clear the user in context
        navigate("/"); // Redirect to the login page
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Network error. Please try again.", error);
    }
  };

  return (
    <nav>
      <header>Veritas</header>
      <div className="auth-links">
        {user ? (
          <>
            <span className="welcome-message">Welcome, {user.username}</span>
            <button type="button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup">
              <button type="button">Sign Up</button>
            </Link>
            <Link to="/">
              <button type="button">Log In</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
