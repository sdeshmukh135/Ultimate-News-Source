import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./contexts/UserContext";
import SignUp from "./components/SignUp.jsx";
import Login from "./components/Login.jsx";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./components/HomePage.jsx";
import WithAuth from "./components/WithAuth.jsx";
import FeaturedPage from "./components/FeaturedPage.jsx";
import ReadLaterPage from "./components/ReadLaterPage.jsx";
import FactCheckPage from "./components/FactCheckPage.jsx"
import "./App.css";

function App() {
  const { user, setUser } = useUser();
  const [isFactCheck, setIsFactCheck] = useState(false); // to toggle between fact-checking and simply searching for specific articles

  // only those logged in should be able to access these pages
  const ProtectedHomePage = WithAuth(HomePage);
  const ProtectedFeaturedPage = WithAuth(FeaturedPage);
  const ProtectedReadLaterPage = WithAuth(ReadLaterPage);
  const ProtectedFactCheckPage = WithAuth(FactCheckPage);

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
          <Route path="/news" element={<ProtectedHomePage isFactCheck={isFactCheck} setIsFactCheck={setIsFactCheck}/>} />
          <Route path="/featured" element={<ProtectedFeaturedPage />} />
          <Route path="/readLater" element={<ProtectedReadLaterPage />} />
          <Route path="/fact-check" element={<ProtectedFactCheckPage isFactCheck={isFactCheck} setIsFactCheck={setIsFactCheck}/>} />
        </Routes>

        <footer>@2025 Veritas</footer>
      </main>
    </Router>
  );
}

export default App;
