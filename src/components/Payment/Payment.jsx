import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderSummary, setOrderSummary] = useState({});
  const [paymentProof, setPaymentProof] = useState(null);

  // Get orderId from URL
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");

  // Fetch Order Details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Check if the customerId in Order matches the current session
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        
        const { data: orderData, error: orderError } = await supabase
          .from('Order')
          .select('*')
          .eq('orderId', orderId)
          .single();

        if (orderError || orderData.customerId !== userSession.customerId) {
          throw new Error("Unauthorized or invalid order.");
        }

        setOrderSummary(orderData);

        // Fetch associated DetailOrder items
        const { data: detailData, error: detailError } = await supabase
          .from('detailOrder')
          .select('productId, productName, quantity, priceTimesQuantity')
          .eq('orderId', orderId);

        if (detailError) throw detailError;

        setOrderDetails(detailData);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Wrong Order Navigating Back to Homepage")
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // File upload handler
  const handleFileChange = (e) => setPaymentProof(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentProof) {
        alert("Please upload proof of payment.");
        return;
    }

    try {
        // Generate a random number
        const randomNumber = Math.floor(Math.random() * 100000); 
        const fileName = `${randomNumber}_${paymentProof.name}`;

        // Upload payment proof to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Gambar')
            .upload(fileName, paymentProof);

        if (uploadError) {
            throw uploadError;
        }

        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
            .from('Gambar')
            .getPublicUrl(fileName);
        const paymentProofUrl = urlData.publicUrl;

        // Update the Payment table with the image URL and payment date
        const paymentDate = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('Payment')
            .update({
                paymentProof: paymentProofUrl,
                paymentDate: paymentDate,
                paymentStatus: 'Waiting Admin Confirmation 1x24'
            })
            .eq('orderId', orderId);

        if (updateError) {
            throw updateError;
        }

        // Update the Order table's statusOrder
        const { error: orderUpdateError } = await supabase
            .from('Order')
            .update({
                statusOrder: 'Waiting for Admin Confirmation',
                statusNo: 2
            })
            .eq('orderId', orderId);

        if (orderUpdateError) {
            throw orderUpdateError;
        }

        toast.success("Payment proof submitted successfully.");
        navigate("/user");

    } catch (error) {
        console.error("Error submitting payment:", error);
        toast.error("Submission error.");
    }
};

  

  const [paymentDeadline, setPaymentDeadline] = useState('');

  useEffect(() => {
    if (orderSummary?.tanggalOrder) {
      const orderDate = new Date(orderSummary.tanggalOrder);

      orderDate.setDate(orderDate.getDate() + 1);

      const deadline = orderDate.toISOString().split('T')[0];
      setPaymentDeadline(deadline);
    }
  }, [orderSummary?.tanggalOrder]);

  return (
    <div className=' w-full min-h-screen bg-gray-800'>
    <div className="container mx-auto min-h-screen flex flex-col items-center py-8  font-rethink">
      <Link to={'/'} className=' text-start w-full text-blue-500 underline mb-4'>Back to Home</Link>
      <div className="flex w-full bg-gray-800 p-6 rounded-md shadow-xl border-[1px] border-gray-600">
        {/* Left Side: Order Summary */}
        <div className="w-1/2 p-4 text-white">
          <h2 className="text-2xl mb-4">Order Summary</h2>
          {orderDetails.map((item) => (
            <div key={item.productId} className="flex justify-between border-b py-2">
              <span>{item.productName} (x{item.quantity})</span>
              <span>Rp. {formatNumDot(item.priceTimesQuantity || 0)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-4">
            <span>Total Price:</span>
            <span>Rp. {formatNumDot(orderSummary.totalPrice || 0)}</span>
          </div>
        </div>

        {/* Right Side: Payment Details */}
        <div className="w-1/2 p-4 text-white">
          <h2 className="text-2xl mb-4">Payment Method</h2>
          <p>Bank Transfer BCA</p>
          <p>Account Number: <span className="font-bold">0613537225</span></p>
          <p>A/N: <span className="font-bold">SELALU MAJU BERSAMA BATAM</span></p>
          
          <h3 className="text-lg mt-6 mb-2">Payment Deadline:</h3>
          <p>{paymentDeadline}</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block mb-1">Upload Proof of Payment</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 bg-gray-700 rounded" required />
            <button type="submit" className="bg-[#509CDB] px-4 py-2 mt-2 rounded text-white">Submit Payment Proof</button>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
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
    </div>
  );
};

function formatNumDot(number) {
  if (number === undefined || number === null) return "0"; // Handle undefined or null
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


export default PaymentPage;
