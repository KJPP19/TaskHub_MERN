import './App.css';
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import SignIn from "./components/signin/signin";
import SignUp from "./components/signup/signup";

function App() {
  return (
    <div className="container">
      <Router>
        <Routes>
          <Route exact path="/signin" element={<SignIn/>}/>
          <Route path='/signup' element={<SignUp/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
