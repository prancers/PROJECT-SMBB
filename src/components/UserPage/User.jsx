    import React, { useEffect, useState } from 'react';
    import { Navbar } from '../HomePage/HomePage'; 
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '../../createClient';

    const Profile = () => {
        const [customerData, setCustomerData] = useState({
          username: '',
          email: '',
          password: '',
          phoneNumber: '',
          address: '',
        });
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
      
        useEffect(() => {
          const fetchCustomerData = async () => {
            const userSession = JSON.parse(localStorage.getItem('userSession'));
            if (!userSession) return;
      
            const { data, error } = await supabase
              .from('Customer')
              .select('*')
              .eq('customerId', userSession.customerId)
              .single();
      
            if (error) {
              setError(error.message);
            } else {
              setCustomerData(data);
            }
            setLoading(false);
          };
      
          fetchCustomerData();
        }, []);
      
        const handleChange = (e) => {
          const { name, value } = e.target;
          setCustomerData({ ...customerData, [name]: value });
        };
      
        const handleSubmit = async (e) => {
          e.preventDefault();
          const userSession = JSON.parse(localStorage.getItem('userSession'));
      
          const { error } = await supabase
            .from('Customer')
            .update(customerData)
            .eq('customerId', userSession.customerId);
      
          if (error) {
            setError(error.message);
          } else {
            alert('Profile updated successfully!');
          }
        };
      
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;
      
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 ">Profile</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={customerData.username}
                  onChange={handleChange}
                  className="border p-2 w-full text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleChange}
                  className="border p-2 w-full text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={customerData.password}
                  onChange={handleChange}
                  className="border p-2 w-full text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={customerData.phoneNumber}
                  onChange={handleChange}
                  className="border p-2 w-full text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Address</label>
                <textarea
                  name="address"
                  value={customerData.address}
                  onChange={handleChange}
                  className="border p-2 w-full text-black"
                  required
                ></textarea>
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Update Profile
              </button>
            </form>
          </div>
        );
      };

      const Order = () => {
        const [orders, setOrders] = useState([]);
        const [selectedOrder, setSelectedOrder] = useState(null);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const navigate = useNavigate();
    
        // Move `fetchOrders` inside the component scope
        const fetchOrders = async () => {
            const userSession = JSON.parse(localStorage.getItem('userSession'));
    
            const { data: orderData, error: orderError } = await supabase
                .from('Order')
                .select(`
                    orderId, statusOrder, tanggalOrder, totalPrice, statusNo,
                    detailOrder (productId, productName, quantity, priceTimesQuantity)
                `)
                .eq('customerId', userSession.customerId)
                .order('orderId', { ascending: false });
    
            if (orderError) {
                console.error('Error fetching orders:', orderError);
                return;
            }
    
            const ordersWithPayments = await Promise.all(orderData.map(async (order) => {
                const { data: paymentData, error: paymentError } = await supabase
                    .from('Payment')
                    .select('paymentId, paymentDate, paymentProof, paymentStatus')
                    .eq('orderId', order.orderId)
                    .single();
    
                if (paymentError) {
                    console.error('Error fetching payment:', paymentError);
                    return order;
                }
    
                const { data: pengirimanData, error: pengirimanError } = await supabase
                    .from('Pengiriman')
                    .select('namaPenerima, alamatPenerima, phoneNumber, tanggalMenerima, tanggalPengiriman')
                    .eq('paymentId', paymentData.paymentId)
                    .single();
    
                if (pengirimanError) {
                    console.error('Error fetching shipping info:', pengirimanError);
                    return { ...order, Payment: paymentData };
                }
    
                return { ...order, Payment: paymentData, Pengiriman: pengirimanData };
            }));
    
            setOrders(ordersWithPayments);
        };
    
        useEffect(() => {
            fetchOrders();
        }, []);
    
        const handleViewDetails = (order) => {
            setSelectedOrder(order);
            setIsModalOpen(true);
        };
    
        const handlePayment = (orderId) => {
            navigate(`/payment?orderId=${orderId}`);
        };
    
        const closeModal = () => {
            setIsModalOpen(false);
            setSelectedOrder(null);
        };
    
        const confirmOrderReceived = async () => {
            if (selectedOrder && selectedOrder.Payment && selectedOrder.Pengiriman) {
                const now = new Date();
                const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                
                const { data, error } = await supabase
                    .from('Pengiriman')
                    .update({ tanggalMenerima: currentDate })
                    .eq('paymentId', selectedOrder.Payment.paymentId);
    
                if (error) {
                    console.error('Error confirming order received:', error);
                } else {
                    alert("Order received has been confirmed.");
                    closeModal();
                    fetchOrders(); // Refresh orders to get the latest state
                }
            }
        };
    
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
    
                {/* Order Summary */}
                <div>
                    {orders.map((order) => (
                        <div key={order.orderId} className="border-b py-2 flex justify-between">
                            <div>
                                <p>Order ID: {order.orderId}</p>
                                <p>Status: {order.statusOrder}</p>
                                <p>Order Date: {order.tanggalOrder}</p>
                                <p>Total Price: Rp. {order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleViewDetails(order)}
                                    className="bg-blue-500 text-white px-4 py-1 rounded mr-2"
                                >
                                    View Details
                                </button>
                                {(!order.Payment || !order.Payment.paymentDate) && (
                                    <button
                                        onClick={() => handlePayment(order.orderId)}
                                        className="bg-green-500 text-white px-4 py-1 rounded"
                                    >
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
    
                {/* Modal for Order Details */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white text-black p-6 rounded-lg w-3/4 max-w-2xl">
                            <button onClick={closeModal} className="float-right text-xl font-bold">×</button>
                            
                            <h2 className="text-xl font-semibold mb-2">Order Details for #{selectedOrder.orderId}</h2>
    
                            <h3 className="font-semibold">Shipping Information:</h3>
                            {selectedOrder.Pengiriman ? (
                                <>
                                    <p>Recipient Name: {selectedOrder.Pengiriman.namaPenerima}</p>
                                    <p>Address: {selectedOrder.Pengiriman.alamatPenerima}</p>
                                    <p>Phone: {selectedOrder.Pengiriman.phoneNumber}</p>
                                    <p>Received Date: {selectedOrder.Pengiriman.tanggalPengiriman || 'Not confirmed'}</p>
                                </>
                            ) : (
                                <p>No shipping information available.</p>
                            )}
    
                            <h3 className="font-semibold mt-4">Products Ordered:</h3>
                            {selectedOrder.detailOrder.map((item) => (
                                <div key={item.productId} className="flex justify-between border-b py-2">
                                    <span>{item.productName} (x{item.quantity})</span>
                                    <span>Rp. {item.priceTimesQuantity.toLocaleString()}</span>
                                </div>
                            ))}
    
                            <h3 className="font-semibold mt-4">Payment Information:</h3>
                            {selectedOrder.Payment ? (
                                <>
                                    <p>Payment Date: {selectedOrder.Payment.paymentDate || 'Pending'}</p>
                                    {selectedOrder.Payment.paymentProof ? (
                                        <img
                                            src={selectedOrder.Payment.paymentProof}
                                            alt="Proof of Payment"
                                            className="w-40 mt-2"
                                        />
                                    ) : (
                                        <p>No proof of payment uploaded.</p>
                                    )}
                                    <p className="mt-1">Payment Status: {selectedOrder.Payment.paymentStatus}</p>
                                    <p className="mt-2 text-gray-500">Contact Admin if payment has not been confirmed in 24 hours.</p>
                                </>
                            ) : (
                                <p>No payment information available.</p>
                            )}
    
                            {/* Confirm Order Received Button */}
                            {selectedOrder.statusNo === 4 && !selectedOrder.Pengiriman.tanggalMenerima && (
                                <button
                                    onClick={confirmOrderReceived}
                                    className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
                                >
                                    Confirm Order Received
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const User = () => {
        const [activePage, setActivePage] = useState('Order');

        const handleSidebarClick = (page) => {
            setActivePage(page);
        };

        const navigate = useNavigate();

        const userLogout = () => {
            localStorage.removeItem('userSession');
            navigate('/')
        }

        return (
            <div className="min-h-screen bg-gray-800 text-white font-rethink">
                {/* Navbar */}
                <Navbar activeLink={'profile'} />

                {/* Main Container */}
                <div className="container mx-auto flex mt-8 ">
                    
                    {/* Sidebar */}
                    <div className="w-1/4 bg-gray-700 p-6 rounded-lg">
                        <h2 className="text-2xl mb-6 font-semibold">User Menu</h2>
                        <ul>
                        <li
                                onClick={() => handleSidebarClick('Order')}
                                className={`cursor-pointer p-2 rounded hover:bg-gray-600 ${activePage === 'Order' ? 'bg-blue-500' : ''}`}
                            >
                                Order
                            </li>
                            <li
                                onClick={() => handleSidebarClick('Profile')}
                                className={`cursor-pointer p-2 rounded hover:bg-gray-600 ${activePage === 'Profile' ? 'bg-blue-500' : ''}`}
                            >
                                Profile
                            </li>

                            <li
                                onClick={userLogout}
                                className="cursor-pointer p-2 rounded hover:bg-gray-600"
                            >
                                Logout
                            </li>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className="w-3/4 bg-gray-900 p-6 rounded-lg ml-4">
                        {activePage === 'Order' && <Order />}
                        {activePage === 'Profile' && <Profile />}
                        {activePage === 'Logout' && (
                            <div>
                                <p className="text-lg">You have been logged out.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    export default User;
