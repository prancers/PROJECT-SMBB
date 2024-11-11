import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient';
import { Navbar } from '../HomePage/HomePage';
import { toast, ToastContainer } from 'react-toastify';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const userSession = JSON.parse(localStorage.getItem('userSession'));
  const navigate = useNavigate();

  // Function to fetch cart items
  const fetchCartItems = async () => {
    console.log("Customer id: ", userSession.customerId);
    const { data, error } = await supabase
      .from('Cart')
      .select('*')
      .eq('customerId', userSession.customerId)
      .order('cartId', { ascending: true });

    if (error) {
      console.error('Error fetching cart items:', error);
    } else {
      setCartItems(data);
      const initialQuantities = {};
      data.forEach(item => {
        initialQuantities[item.cartId] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  };

  // Function to delete a cart item
  const deleteCartItem = async (cartId) => {
    const { data, error } = await supabase
      .from('Cart')
      .delete()
      .eq('cartId', cartId)
      .eq('customerId', userSession.customerId);

    if (error) {
      console.error('Error deleting cart item:', error);
    } else {
      console.log('Cart item deleted successfully:', data);
      // Refresh cart items after deletion
      await fetchCartItems();
    }
  };

  const updateQuantityInDatabase = async (cartId, newQuantity, price) => {
    const newPriceTimesQuantity = newQuantity * price;

    const { data, error } = await supabase
      .from('Cart')
      .update({ quantity: newQuantity, priceTimesQuantity: newPriceTimesQuantity })
      .eq('cartId', cartId)
      .eq('customerId', userSession.customerId);

    if (error) {
      console.error('Error updating quantity and price:', error);
    } else {
      console.log('Quantity and price updated successfully:', data);
    }
  };

  const formatNumDot = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleQuantityChange = async (cartId, change, price, productId) => {
    setIsUpdating(true);
  
    // Calculate the new quantity based on the current quantity and the change
    const newQuantity = Math.max(1, (quantities[cartId] || 1) + change);
  
    // Fetch the stock from the Product table using the productId
    const { data: productData, error: productError } = await supabase
      .from('Product')
      .select('stock')
      .eq('productId', productId)
      .single();
  
    if (productError) {
      console.error('Error fetching stock:', productError);
      toast.error('Error checking stock availability.');
      setIsUpdating(false);
      return;
    }
  
    const stock = productData.stock;
  
    // If the new quantity exceeds stock, adjust to the stock level and show a toast
    if (newQuantity > stock) {
      toast.error(`Stock for this item is limited to ${stock}. Quantity adjusted.`);
      await updateQuantityInDatabase(cartId, stock, price);
    } else {
      // Otherwise, update to the new quantity
      await updateQuantityInDatabase(cartId, newQuantity, price);
    }
  
    // Refresh cart items to reflect the updated state from the database
    await fetchCartItems();
  
    setIsUpdating(false);
  };
  

  useEffect(() => {
    fetchCartItems();
  }, [userSession.customerId]);

  const handleCheckout = () => {
    if (!isUpdating) {
      navigate('/InsertInfoOrder', { state: { cartItems } });
    }
  };

  return (
    <div className='bg-gray-800 min-h-screen px-4 font-rethink'>
      <Navbar activeLink={'cart'} />
      <div className='container mx-auto px-4 font-rethink text-white py-4'>
        <div className='flex flex-row justify-between w-full'>
          <h2 className='text-[28px]'>Item Cart</h2>
          <button
            className={`bg-[#509CDB] px-3 py-2 rounded-lg`}
            onClick={handleCheckout}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating Cart...' : 'Checkout Cart'}
          </button>
        </div>

        {cartItems.length > 0 ? (
          cartItems.map((cart) => {
            const currentQuantity = quantities[cart.cartId] || cart.quantity;
            const currentPriceTimesQuantity = currentQuantity * cart.price;

            return (
              <div key={cart.cartId} className='relative flex items-center mt-4 justify-between border-[1px] border-gray-500 p-4 rounded-lg'>
                <button
                  onClick={() => deleteCartItem(cart.cartId)}
                  className="absolute top-0 right-4 text-gray-300 text-[30px] hover:text-red-700"
                  aria-label="Remove item"
                >
                  &times;
                </button>
                
                <div className='flex flex-row gap-8 items-center'>
                  <img src={cart.productImage} alt={cart.productName} className="w-[200px] py-12 object-cover" />
                  <div className='flex flex-col'>
                    <h2 className='text-white text-[20px]'>{cart.productName}</h2>
                    <h2 className='text-gray-400 text-[14px]'>{cart.description}</h2>
                    <h2 className='text-white text-[14px] mt-4'>{cart.kodepart}</h2>
                  </div>
                </div>

                <div className='flex flex-col items-center mt-8'>
                  <h2>Rp.{formatNumDot(currentPriceTimesQuantity)}</h2>

                  <div className="flex items-center">
                    <button
                      className="text-white text-[20px] px-2"
                      onClick={() => handleQuantityChange(cart.cartId, -1, cart.price, cart.productId)}
                    >
                      -
                    </button>
                    <span className="text-white text-[20px] px-2">
                      {currentQuantity}
                    </span>
                    <button
                      className="text-white text-[20px] px-2"
                      onClick={() => handleQuantityChange(cart.cartId, 1, cart.price, cart.productId)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className='text-white text-[20px]'>Your cart is empty.</div>
        )}
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
}

export default Cart;
