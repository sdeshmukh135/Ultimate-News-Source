import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "./contexts/UserContext";
import SignUp from "./components/SignUp.jsx";
import Login from "./components/Login.jsx";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./components/HomePage.jsx";
import WithAuth from "./components/WithAuth.jsx";
import FeaturedPage from "./components/FeaturedPage.jsx";
import "./App.css";

function App() {
  const { user, setUser } = useUser();

  // only those logged in should be able to access these pages
  const ProtectedHomePage = WithAuth(HomePage);
  const ProtectedFeaturedPage = WithAuth(FeaturedPage);

  // set the user (whenever a new user is logged in)
  useEffect(() => {
    fetch("http://localhost:3000/loggedin", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          setUser(data); // Set the user in context
        }
      });
  }, [setUser]);

  return (
    <Router>
      <main>
        <NavBar />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/news" element={<ProtectedHomePage />} />
          <Route path="/featured" element={<ProtectedFeaturedPage />} />
        </Routes>

        <footer>@2025 Veritas</footer>
      </main>
    </Router>
  );
}

export default App;
