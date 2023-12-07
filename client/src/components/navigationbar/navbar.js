import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import taskhublogo from "../../assets/img/taskhub-logo.png";
import './navbar.css';

function NavBar () {

    const navigate = useNavigate();
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            delete axios.defaults.headers.common['Authorization'];
            setIsLoggedOut(true);
        } catch(error) {
            console.error('lgout failed', error);
        };
    };
    if(isLoggedOut){
        console.log('logout success');
        navigate("/signin");
    }

    return (
        <div>
            <nav className='header'>
                <img src={taskhublogo} alt='logo' className='headerlogo'/>
                <ul className='menuitems'>
                    <li><a href='/dashboard'>Dashboard</a></li>
                    <li><a href='#'>Manage Boards</a></li>
                    <li>
                        <button className='createboard' onClick={openPopup}>Create Board</button>
                    </li>
                </ul>
                <div className='spacer'></div>
                <div>
                    <button className='logout-button' onClick={handleLogout}>Logout</button>
                </div>
            </nav>
        </div>
    );
};

export default NavBar;