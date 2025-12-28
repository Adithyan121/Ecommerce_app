import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaHome, FaShoppingCart, FaUser, FaSignInAlt, FaSearch, FaSun, FaMoon } from 'react-icons/fa';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (keyword.trim().length > 1) { // Start searching after 2 chars

        // Live Page Update Logic
        const isSearchPage = location.pathname === '/' || location.pathname.startsWith('/search');
        if (isSearchPage) {
          navigate(`/search/${keyword}`, { replace: true });
        }

        try {
          const { data } = await api.get(`/products?keyword=${keyword}`);
          setSearchResults(data.slice(0, 6)); // Limit 6 results
          setShowDropdown(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
        // Optional: navigating back to home if clear? No, might be annoying.
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]); // Note: excluding location/navigate from deps to avoid loop if not careful? 
  // Actually location.pathname is needed to check mode.
  // BUT if navigate runs, location changes... trigger effect again?
  // keyword hasn't changed, so effect won't re-run. Safe.

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
      setShowDropdown(false);
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={logo} alt="ShopWave" style={{ height: '60px' }} />
        </Link>

        <div className="search-box" ref={searchRef}>
          <form onSubmit={submitHandler}>
            <input
              type="text"
              name="q"
              onChange={(e) => setKeyword(e.target.value)}
              value={keyword}
              placeholder="Search..."
              className="search-input"
              autoComplete="off"
            />
            <button type="submit" className="search-btn"><FaSearch /></button>
          </form>
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              <ul>
                {searchResults.map(product => (
                  <li key={product._id} onClick={() => {
                    navigate(`/product/${product._id}`);
                    setShowDropdown(false);
                    setKeyword('');
                  }}>
                    <img src={product.images?.[0] || product.image || 'https://via.placeholder.com/40'} alt={product.name} />
                    <div className="search-item-info">
                      <span className="search-item-name">{product.name}</span>
                      <span className="search-item-price">₹{product.salePrice || product.price}</span>
                    </div>
                  </li>
                ))}
                <li className="view-all-results" onClick={submitHandler}>
                  View all results for "{keyword}"
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          <div className="menu-icon" onClick={toggleMenu}>
            <span className={isMenuOpen ? 'bar open' : 'bar'}></span>
            <span className={isMenuOpen ? 'bar open' : 'bar'}></span>
            <span className={isMenuOpen ? 'bar open' : 'bar'}></span>
          </div>

          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={closeMenu}><span className="nav-icon"><FaHome /></span> Home</Link></li>
            <li><Link to="/cart" onClick={closeMenu}><span className="nav-icon"><FaShoppingCart /></span> Cart</Link></li>
            {user ? (
              <>

                <li><Link to="/profile" className="user-name" onClick={closeMenu}><span className="nav-icon"><FaUser /></span> {user.name} {user.isAdmin && '(Admin)'}</Link></li>
                <li><button onClick={() => { logout(); closeMenu(); }} className="btn-logout">Logout</button></li>
              </>
            ) : (
              <li><Link to="/login" onClick={closeMenu}><span className="nav-icon"><FaSignInAlt /></span> Login</Link></li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
