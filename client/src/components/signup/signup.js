import React, {useRef, useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import taskhublogo from "../../assets/img/taskhub-logo.png";
import "./signup.css";

function SignUp() {
    
    const emailRef = useRef('');
    const firstnameRef = useRef('');
    const lastnameRef = useRef('');
    const passwordRef = useRef('');
    const navigate = useNavigate();
    const [registerError, setRegisterError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const signUpFormData = {
            email: emailRef.current.value,
            firstname: firstnameRef.current.value,
            lastname: lastnameRef.current.value,
            password: passwordRef.current.value,
        };

        try {
            const response = await axios.post("http://127.0.0.1:3001/api/v1/register", signUpFormData);
            if (response.status === 201) {
                navigate("/signin");
            }
        } catch(error) {
            console.error('Error', error);
            if(error.response && error.response.status === 422) {
                const errorMessage = error.response.data?.error?.message;
                setRegisterError(errorMessage);
            }
            else if(error.response && error.response.status === 400) {
                const errorMessage = error.response.data?.error?.message;
                setRegisterError(errorMessage);
            }
        };
    };

    const handleResetRegError = async () => {
        setRegisterError('');
    }

    return (
        <div>
            <img src={taskhublogo} alt="logo" className="thlogo"/>
            <div className="signup-form-container">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="signup-title">Sign up</div>
                    {registerError && <div className="register-error-text">{registerError}</div>}
                    <input type="text" ref={emailRef} placeholder="Enter your Email" onChange={handleResetRegError}/>
                    <input type="text" ref={firstnameRef} placeholder="Enter your first name"/>
                    <input type="text" ref={lastnameRef} placeholder="Enter your last name"/>
                    <input type="password" ref={passwordRef} placeholder="Enter your password"/>
                    <button type="submit" className="signup-button">Sign up</button>
                    <div>
                        <span className="footer-text"> Have an Account?
                            <Link to="/signin" className="login-text"> Login</Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default SignUp;