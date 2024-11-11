import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InsertInfoOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const cartItems = location.state?.cartItems || []; // Get cart items from location state

  const [formData, setFormData] = useState({
    namaPenerima: '',
    alamatPenerima: '',
    phoneNumber: '',
  });
  const [totalPrice, setTotalPrice] = useState(0);
  
  useEffect(() => {
    // Calculate total price from cart items
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  function formatNumDot(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Insert into Order table
      const userSession = JSON.parse(localStorage.getItem('userSession'));
      const today = new Date();
      const tanggalOrder = today.toISOString().split('T')[0];
  
      const { data: orderData, error: orderError } = await supabase
        .from('Order')
        .insert([
          {
            customerId: userSession.customerId,
            tanggalOrder: tanggalOrder,
            totalPrice: totalPrice,
            statusOrder: 'waiting for payment',
            statusNo: 1,
          },
        ])
        .select('orderId')
        .single();
  
      if (orderError) {
        throw orderError;
      }
  
      const orderId = orderData.orderId;
  
      // Step 2: Insert into Payment table using orderId
      const { data: paymentData, error: paymentError } = await supabase
        .from('Payment')
        .insert([
          {
            orderId: orderId,
            paymentTotal: totalPrice,
            paymentStatus: 'waiting for payment',
          },
        ])
        .select('paymentId')
        .single();
  
      if (paymentError) {
        throw paymentError;
      }
  
      const paymentId = paymentData.paymentId;
  
      // Step 3: Insert into Pengiriman table using paymentId
      const { data: pengirimanData, error: pengirimanError } = await supabase
        .from('Pengiriman')
        .insert([
          {
            namaPenerima: formData.namaPenerima,
            alamatPenerima: formData.alamatPenerima,
            phoneNumber: formData.phoneNumber,
            paymentId: paymentId, // Associate Pengiriman with Payment
          },
        ]);
  
      if (pengirimanError) {
        throw pengirimanError;
      }
  
      // Step 4: Insert each cart item into DetailOrder table
      const detailOrderData = cartItems.map((item) => ({
        orderId: orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceTimesQuantity: item.price * item.quantity,
      }));
  
      const { error: detailOrderError } = await supabase
        .from('detailOrder')
        .insert(detailOrderData);
  
      if (detailOrderError) {
        throw detailOrderError;
      }
  
      // Step 5: Delete all items from the Cart table for this customer
      const { error: deleteError } = await supabase
        .from('Cart')
        .delete()
        .eq('customerId', userSession.customerId);
  
      if (deleteError) {
        throw deleteError;
      }
  
      console.log('Order, detail order, cart cleared, and payment entry added successfully');
      navigate(`/payment?orderId=${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };
  
  
  
  

  return (
    <div className=' bg-gray-800 font-rethink'>
    <div className='bg-gray-800 container mx-auto px-3'>
            <h2 className=' w-full p-7  underline text-blue-300 cursor-pointer' onClick={() => navigate('/cart')}>Back to Cart</h2>
    <div className='bg-gray-800 min-h-screen flex  container mx-auto px-3 '>

        <div className=' flex-col flex'>

        </div>

      <div className='w-1/2 p-4 text-white '>
        <h2 className='text-2xl mb-4'>Order Information</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block mb-1'>Nama Penerima</label>
            <input
              type='text'
              name='namaPenerima'
              value={formData.namaPenerima}
              onChange={handleChange}
              className='w-full p-2 rounded bg-gray-700'
              placeholder='Nama Penerima'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block mb-1'>Alamat Penerima</label>
            <textarea
              name='alamatPenerima'
              rows={7}
              value={formData.alamatPenerima}
              onChange={handleChange}
              className='w-full p-2 rounded bg-gray-700'
              placeholder='Alamat'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block mb-1'>Phone Number</label>
            <input
              type='tel'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={handleChange}
              className='w-full p-2 rounded bg-gray-700'
              placeholder='Phone Number'
              required
            />
          </div>

          <button type='submit' className='bg-[#509CDB] px-4 py-2 mt-2 rounded'>
            Submit Order
          </button>
        </form>
      </div>

      <div className='w-1/2 p-4 text-white'>
        <h2 className='text-2xl mb-4'>Order Summary</h2>
        {cartItems.length > 0 ? (
          <div>
            {cartItems.map((item) => (
              <div key={item.cartId} className='flex justify-between border-b py-2'>
                <span>{item.productName} (x{item.quantity})</span>
                <span>Rp. {formatNumDot(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className='flex justify-between font-bold mt-4'>
              <span>Total Price:</span>
              <span>Rp. {formatNumDot(totalPrice)}</span>
            </div>
          </div>
        ) : (
          <div>Your cart is empty.</div>
        )}
      </div>
    </div>
    </div>
    <ToastContainer
        position="top-center"
        autoClose={3000}
        limit={2}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default InsertInfoOrder;
