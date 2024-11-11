import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient';
import { Navbar } from '../HomePage/HomePage';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate that password matches confirm password
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Check if email already exists
            const { data: existingUser, error: emailCheckError } = await supabase
                .from('Customer')
                .select('*')
                .eq('email', email)
                .single();

            if (emailCheckError && emailCheckError.code !== 'PGRST116') { // Only proceed if error is other than "No rows returned" (which means email doesn't exist)
                setError('An error occurred while checking the email.');
                console.error(emailCheckError);
                return;
            }

            if (existingUser) {
                setError('Email already exists. Please use a different email.');
                return;
            }

            // Insert new user data into 'Customer' table
            const { data, error } = await supabase
                .from('Customer')
                .insert([
                    { 
                        username: username,
                        password: password,
                        email: email,
                        phoneNumber: phonenumber,
                        address: null
                    }
                ]);

            if (error) {
                setError('Signup failed. Please try again.');
                console.error(error);
            } else {
                setSuccess('Signup successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login'); // Redirect to login page after a delay
                }, 2000);
            }
        } catch (error) {
            setError('Signup failed. Please try again.');
            console.error(error);
        }
    };

    return (
        <div className='bg-gray-800'>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-[#1A202C] text-white font-rethink">
                <div className="w-[400px] bg-[#2D3748] p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl mb-6">SMBB Signup</h2>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    {success && <div className="text-green-500 mb-4">{success}</div>}
                    <form onSubmit={handleSignup}>
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
                        <div className="mb-4">
                            <label className="block mb-2">Phone Number:</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                value={phonenumber}
                                onChange={(e) => setPhonenumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Password:</label>
                            <input
                                type="password"
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2">Confirm Password:</label>
                            <input
                                type="password"
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full p-3 bg-[#509CDB] hover:bg-[#3B82F6] rounded">
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
