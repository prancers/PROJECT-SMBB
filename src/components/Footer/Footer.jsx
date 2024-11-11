import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-200 py-8 mt-[500px]">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* About Us Column */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">About Us</h2>
                    <p className="text-gray-400">
                        SMB AutoParts Group berdiri sejak 27 Mei 2020 di Batam, Kepulauan Riau. Kami menyediakan body parts mobil berkualitas untuk memenuhi kebutuhan pelanggan di Batam.
                    </p>
                </div>

                {/* Quick Links Column */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
                    <ul className="space-y-2">
                        <li><a href="/aboutus" className="hover:text-blue-400">About Us</a></li>
                        <li><a href="/products" className="hover:text-blue-400">Products</a></li>
                        <li><a href="/contactus" className="hover:text-blue-400">Contact</a></li>
                        <li><a href="/faq" className="hover:text-blue-400">FAQ</a></li>
                    </ul>
                </div>

                {/* Contact Us Column */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
                    <p className="text-gray-400">Email: support@bestinteria.com</p>
                    <p className="text-gray-400">Phone: +123 456 7890</p>
                    <div className="mt-4 flex space-x-4">
                        <a href="#" className="hover:text-blue-400"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="hover:text-blue-400"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="hover:text-blue-400"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="hover:text-blue-400"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                {/* Newsletter Column */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Subscribe to Our Newsletter</h2>
                    <p className="text-gray-400 mb-4">Get the latest updates on new products and upcoming sales.</p>
                    <form className="flex">
                        <input 
                            type="email" 
                            placeholder="Your email" 
                            className="w-full p-2 rounded-l-md text-gray-800 focus:outline-none"
                        />
                        <button className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className="text-center mt-8 text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Selalu Maju Bersama Batam. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
