import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();

      try {
        const { data: admin, error } = await supabase
          .from('Admin')
          .select('*')
          .eq('username', username)
          .single();
    
        if (error || !admin) {
          setError('Login failed. No such user found.');
          return;
        }
    
        if (admin.password === password) {
          localStorage.setItem('adminSession', JSON.stringify({
            username: admin.username,
            isAdmin: true, 
          }));
          
          navigate('/admin');
        } else {
          setError('Incorrect password.');
        }
      } catch (error) {
        setError('Login failed. Please try again.');
        console.error(error);
      }
    };
  
    return (
      <div className="h-screen flex items-center justify-center bg-[#1A202C] text-white font-rethink">
        <div className="w-[400px] bg-[#2D3748] p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl mb-6">SMBB ADMIN</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2">Username :</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2">Password:</label>
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full p-2 bg-[#509CDB] hover:bg-[#3B82F6] rounded">
              Login
            </button>
          </form>
        </div>
      </div>
    );
};

export default AdminLogin;
