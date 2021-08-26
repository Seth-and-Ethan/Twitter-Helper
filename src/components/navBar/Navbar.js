import React from 'react';
import './Navbar.scss'
import { NavLink, useHistory, withRouter } from 'react-router-dom';
import { destroyAuth } from '../../verifyLogin';

const NavBar = () => {
    const history = useHistory();

    const logout=()=>{
        destroyAuth()
        history.push("/login")
    }

    return (
    <nav>
        <h1>Twitter Helper</h1>
        <ul className = 'nav-links'>
            <NavLink 
                className='nav-item'
                to="/home"
                exact
                activeStyle={{
                    fontWeight: 800,
                }}>
                Home
            </NavLink>
            <NavLink 
                className='nav-item'
                to="/analysis"
                activeStyle={{
                    fontWeight: 800,
                }}>
                Sentiment Analysis
            </NavLink>
            <button
                className='signout'
                onClick={logout}
            >
                Sign Out
            </button>

        </ul>
    </nav>
    );
}

export default NavBar;