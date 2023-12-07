import React, {useRef, useState} from 'react';
import taskhublogo from '../../assets/img/taskhub-logo.png';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './signin.css'

function SignIn() {
    const emailRef = useRef('');
    const passwordRef = useRef('');
    const navigate = useNavigate();

    const [authError, setAuthError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        try {
            const response = await axios.post("http://127.0.0.1:3001/api/v1/login", formData);
            const {accesstoken, refreshtoken} = response.data;
            localStorage.setItem("accessToken", accesstoken);
            localStorage.setItem("refreshToken", refreshtoken);
            navigate("/home");
        } catch (error) {
            console.error('Error', error);
            if(error.response && error.response.status === 400) {
                const errorMessage = error.response.data?.error?.detail;
                setAuthError(errorMessage);
            }
        };
    };

    const handleResetAuthError = async () => {
        setAuthError('');
    };

    return (
        <div>
            <img src={taskhublogo} alt="logo" className='thlogo'/>
            <div className='form-container'>
                <form className='login-form' onSubmit={handleSubmit}>
                    <div className='login-title'>Login</div>
                    {authError && <div className='error-text'>{authError}</div>}
                    <input type='text' ref={emailRef} placeholder='Enter your Email' onChange={handleResetAuthError}/>
                    <input type='password' ref={passwordRef} placeholder='Enter your password'/>
                    <button type='submit' className='login-button'>Log in Now</button>
                    <button type='button' className='login-google'>Log in with Google (WIP)</button>
                    <div className='signup'>
                        <span className='footer-text'>
                            No account yet? 
                            <Link to="/signup" className='signup-text'> Signup</Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SignIn;