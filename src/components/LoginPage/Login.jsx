import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient';
import { Navbar } from '../HomePage/HomePage';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Query to check if the email and password match an existing user
            const { data: user, error } = await supabase
                .from('Customer')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .single();

            if (error) {
                setError('Login failed. Please check your email and password.');
                console.error(error);
            } else {
                localStorage.setItem('userSession', JSON.stringify(user));
                navigate('/');
            }
        } catch (error) {
            setError('An error occurred during login. Please try again.');
            console.error(error);
        }
    };

    return (
        <div className='bg-gray-800'>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-[#1A202C] text-white font-rethink">
                <div className="w-[400px] bg-[#2D3748] p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl mb-6">Login</h2>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block mb-2">Email:</label>
                            <input
                                type="email"
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        <button type="submit" className="w-full p-3 bg-[#509CDB] hover:bg-[#3B82F6] rounded">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
