import React from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.css';

const navItems = [
  { id: 'feed', text: 'Feed', link: '/', auth: true },
  { id: 'login', text: 'Login', link: '/', auth: false },
  { id: 'signup', text: 'Signup', link: '/signup', auth: false }
];

const NavigationItems = ({ isAuth, mobile, onChoose, onLogout }) => {
  return (
    <ul className="navigation-items">
      {navItems
        .filter(item => item.auth === isAuth)
        .map(item => (
          <li
            key={item.id}
            className={['navigation-item', mobile ? 'mobile' : ''].join(' ')}
          >
            <NavLink to={item.link} exact="true" onClick={onChoose}>
              {item.text}
            </NavLink>
          </li>
        ))}

      {isAuth && (
        <li className="navigation-item" key="logout">
          <button onClick={onLogout}>Logout</button>
        </li>
      )}
    </ul>
  );
};

export default NavigationItems;
