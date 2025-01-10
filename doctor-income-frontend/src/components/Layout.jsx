import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { profileService } from '../services/api';

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await profileService.getAllProfiles();
          if (response.data && response.data[0]) {
            setUsername(response.data[0].name);
          }
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      }
      setIsAuthenticated(!!token);
    };
  
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUsername('');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-1 left-1 z-50 text-white bg-gray-800 p-2 rounded shadow-lg" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Sidebar */}
      <nav className={`w-64 bg-gray-800 fixed inset-y-0 left-0 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-200 ease-in-out z-10`}>
        <div className="h-full flex flex-col">
          <div className="p-4">
            <div className="text-white mb-8 mt-6 text-xl font-bold">
              {username}
            </div>
            <ul className="space-y-2">
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className="text-gray-300 hover:text-white block p-2"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="text-gray-300 hover:text-white block p-2"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/transactions" 
                      className="text-gray-300 hover:text-white block p-2"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Transactions
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/employers" 
                      className="text-gray-300 hover:text-white block p-2"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Employers
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/profile" 
                      className="text-gray-300 hover:text-white block p-2"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/fakturownia" 
                      className="text-gray-300 hover:text-white block p-2"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Fakturownia
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsSidebarOpen(false);
                      }}
                      className="text-gray-300 hover:text-white block p-2 w-full text-left"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-64 bg-gray-100 min-h-screen">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Outlet context={{ isSidebarOpen }} />
      </main>
    </div>
  );
}