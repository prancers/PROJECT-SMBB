import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient'
import { Link } from 'react-router-dom';
import logo_smbb from '../../assets/image/logosmbb.jpeg'
import { FaUserCircle } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineAddBox } from "react-icons/md";
import border from '../../assets/image/border.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../Footer/Footer';


export const Navbar = ({activeLink}) => {

const userSession = JSON.parse(localStorage.getItem('userSession'));

const navigate = useNavigate();

  return (
    <nav className="container mx-auto py-3 flex items-center justify-between bg-gray-800 text-white font-rethink">
      <div className="flex items-center">
        <img 
          src={logo_smbb}
          alt="Logo"
          className=' w-auto h-[70px] rounded-lg mr-4 cursor-pointer'
          onClick={() => navigate('/')}
        />
        <div className=' flex flex-col'>
        <span className="text-[20px] font-semibold cursor-pointer" onClick={() => navigate('/')}>SELALU MAJU</span>
        <span className=" text-[20px] font-semibold cursor-pointer" onClick={() => navigate('/')}>BERSAMA BATAM</span>

        </div>
      </div>

      <div className="flex gap-12 text-base items-center">
        <Link to="/" className={`hover:text-[hsl(207,66%,59%)] duration-200 ${activeLink === 'products' ? 'text-[hsl(207,66%,59%)]' : ''}`}>Products</Link>
        <Link to="/aboutus" className={`hover:text-[hsl(207,66%,59%)] duration-200 ${activeLink === 'aboutus' ? 'text-[hsl(207,66%,59%)]' : ''}`}>About Us</Link>
        <Link to="/contactus" className={`hover:text-[hsl(207,66%,59%)] duration-200 ${activeLink === 'contactus' ? 'text-[hsl(207,66%,59%)]' : ''}`}>Contact Us</Link>

        {userSession  ? 
            <div className=' flex flex-row gap-8 items-center'>
                <FaUserCircle size={25} className={` cursor-pointer hover:text-[#519ddb] duration-200 ${activeLink === 'profile' ? 'text-[hsl(207,66%,59%)]' : ''}`} onClick={() => navigate('/user')} />
                <FaShoppingCart size={25} className={` cursor-pointer hover:text-[#519ddb] duration-200 ${activeLink === 'cart' ? 'text-[hsl(207,66%,59%)]' : ''}`} onClick={() => navigate(`/cart`)} />
            </div>
        : 
            <div className=' flex flex-row gap-4 items-center'>
                <Link to="/signup" className="rounded hover:bg-white hover:text-black duration-300 ease-in-out border-[1px] p-2">Sign Up</Link>
                <Link to="/login" className="rounded hover:bg-white hover:text-black duration-300 ease-in-out border-[1px] p-2">Login</Link>
            </div>
        }


      </div>
    </nav>
  );
};

export const successToast = (msg) => {
    toast.success(msg, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
};



function formatNumDot(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const Carousel = () => {
    return (
        <div className='container mx-auto py-4 flex items-center justify-between bg-gray-800 text-white'>
            <img className=' w-full h-[420px] bg-gray-500 rounded' src={border} />
        </div>
    )
}

const ProductCustomer = () => {
  const [brands, setBrands] = useState([]);
  const [cars, setCars] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [selectedCategory, setselectedCategory] = useState(null);
  const [selectedCategoryId, setselectedCategoryId] = useState(null);
  const [product, setProduct] = useState([]);
  const [kodepart, setKodepart] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
      const fetchBrands = async () => {
          const { data, error } = await supabase.from('Brand').select('brandId, brandName, imageUrl');
          if (!error) setBrands(data);
      };
      fetchBrands();
  }, []);

  useEffect(() => {
      const fetchCarByBrand = async (brandId) => {
          const { data, error } = await supabase
              .from('Type')
              .select('typeId, typeName, imageUrl')
              .eq('brandId', brandId);
          if (!error) setCars(data);
      };

      if (selectedBrandId) {
          fetchCarByBrand(selectedBrandId);
      } else {
          setCars([]);
      }
  }, [selectedBrandId]);

  useEffect(() => {
      const fetchCategory = async () => {
          const { data, error } = await supabase.from('Category')
          .select('categoryId, categoryName')
          .eq('typeId', selectedCarId)
          if (!error) setCategory(data);
      };

      if (selectedCarId) {
          fetchCategory();
      } else {
          setCategory([]);
      }
  }, [selectedCarId]);

  useEffect(() => {
    const fetchProductByKodepartOrName = async () => {
        const { data, error } = await supabase
            .from('Product')
            .select('*')
            .or(`kodepart.ilike.%${kodepart}%,productName.ilike.%${kodepart}%`)
            .eq('categoryId', selectedCategoryId)
            .order('productId', { ascending: true });
        if (!error) setProduct(data);
    };

    const fetchProductByTypeAndCategory = async () => {
        const { data, error } = await supabase
            .from('Product')
            .select('*')
            .eq('categoryId', selectedCategoryId)
            .order('productId', { ascending: true });

        if (!error) setProduct(data);
    };

    if (kodepart) {
        fetchProductByKodepartOrName();
    } else if (selectedCarId && selectedCategoryId) {
        fetchProductByTypeAndCategory();
    }
    }, [kodepart, selectedCarId, selectedCategoryId]);

    const userSession = JSON.parse(localStorage.getItem('userSession'));

    const [quantities, setQuantities] = useState({});

    const handleQuantityChange = (id, change, stock) => {
        setQuantities(prevQuantities => {
        const newQuantity = (prevQuantities[id] || 1) + change;
        if (newQuantity > stock) {
            toast.error('Quantity exceeds available stock');
            return prevQuantities;
        }
        return {
            ...prevQuantities,
            [id]: Math.max(1, newQuantity),
        };
        });
    };
    
    const addItemToCart = async (productId, productName, price, quantity, imageUrl, desc, kode, stock) => {
        if (stock <= 0) {
        toast.error('Product not available');
        return;
        }
    
        if (quantity > stock) {
        toast.error('Quantity exceeds available stock');
        return;
        }
    
        if (!userSession) {
        toast.error('Customer not logged in');
        return;
        }
    
        const { data: cartItems, error: fetchError } = await supabase
        .from('Cart')
        .select('*')
        .eq('customerId', userSession.customerId)
        .eq('productId', productId);
    
        if (fetchError) {
        console.error('Error fetching cart items:', fetchError);
        return;
        }
    
        if (cartItems.length > 0) {
        const existingItem = cartItems[0];
        const newQuantity = existingItem.quantity + quantity;
    
        if (newQuantity > stock) {
            toast.error('Quantity exceeds available stock');
            return;
        }
    
        const { data, error } = await supabase
            .from('Cart')
            .update({ quantity: newQuantity })
            .eq('cartId', existingItem.cartId);
    
        if (error) {
            console.error('Error updating cart item quantity:', error);
        } else {
            console.log('Cart item quantity updated:', data);
            successToast('Quantity updated successfully');
        }
        } else {
        const { data, error } = await supabase
            .from('Cart')
            .insert([{
            customerId: userSession.customerId,
            productId: productId,
            productName: productName,
            quantity: quantity,
            productImage: imageUrl,
            price: price,
            description: desc,
            kodepart: kode
            }]);
    
        if (error) {
            console.error('Error adding item to cart:', error);
        } else {
            console.log('Item added to cart:', data);
            successToast('Item successfully added to cart');
        }
        }
    };
  

  return (
    <div className='container mx-auto py-4 flex items-center justify-between'>
      <div className="text-white font-rethink w-full ">
          <div className="mb-4 w-full">
              <h1 className="text-2xl mb-2">Choose Car Brands</h1>
              <div className="flex flex-wrap gap-4 justify-between w-full">
                  {brands.map((brand, index) => (
                      <div
                          key={index}
                          className={`p-4 rounded shadow-lg flex flex-col items-center justify-center w-44 cursor-pointer ${selectedBrand === brand.brandName ? 'bg-[#509CDB]' : 'bg-[#465677]'}`}
                          onClick={() => {
                              setSelectedBrandId(brand.brandId);
                              setSelectedBrand(brand.brandName);
                          }}
                      >
                          <img src={brand.imageUrl} alt={brand.brandName} className="w-auto max-h-[90px] h-full mb-4" />
                          <span className="text-center text-[#1A202C] font-semibold uppercase">{brand.brandName}</span>
                      </div>
                  ))}
              </div>
          </div>

          {selectedBrandId && (
              <div className="mt-8 w-full ">
                  <h2 className="text-2xl mb-2">Available {selectedBrand} Cars</h2>
                  <div className={`flex flex-wrap gap-16 w-full  ${cars.length < 4 ? 'justify-normal' : 'justify-between'}`}>
                      {cars.map((car) => (
                          <div
                              key={car.typeId}
                              className={`bg-[#465677] p-4 rounded shadow-lg flex flex-col items-center justify-center w-40 h-[200px] cursor-pointer ${selectedCarId === car.typeId ? 'bg-[#509CDB]' : ''}`}
                              onClick={() => {
                                  setSelectedCarId(car.typeId);
                                  setSelectedCar(car.typeName);
                              }}
                          >
                              <img src={car.imageUrl} alt={car.typeName} className="w-full h-auto mb-4" />
                              <span className="text-center text-white text-[18px]">{car.typeName}</span>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {selectedCarId && (
              <div className="mt-8">
                  <div className="flex  gap-4 justify-between">
                      {category.map((cat) => (
                          <div
                              key={cat.categoryId}
                              className={`bg-[#465677] p-4 rounded shadow-lg flex flex-col items-center justify-center w-full cursor-pointer ${selectedCategoryId === cat.categoryId ? 'bg-[#509CDB]' : ''}`}
                              onClick={() => {
                                  setselectedCategory(cat.categoryName);
                                  setselectedCategoryId(cat.categoryId);
                              }}
                          >
                              <span className="text-center text-white text-[18px]">{cat.categoryName}</span>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {selectedCategory && (
              <div className="mt-8">
                <div className=' flex flex-row justify-between mb-4 items-center'>
                    <h2 className="text-2xl mb-4">Products for {selectedCategory} {selectedCar}</h2>
                    <div className="flex flex-row items-center">
                        <h2 className="text-[18px] mr-4">Search by Kodepart / Name</h2>
                        <input
                            type="text"
                            placeholder="Kodepart/Name"
                            className="py-2 px-3 text-[18px] rounded-lg bg-[hsl(220,26%,57%)] text-white"
                            value={kodepart}
                            onChange={(e) => setKodepart(e.target.value)}
                        />
                    </div>
                </div>
                  <div className="flex flex-wrap gap-4">
                      {product.map((pro) => (
                          <div
                              key={pro.productId}
                              className="bg-[#465677] p-4 rounded shadow-lg flex items-start w-full cursor-pointer hover:bg-[hsl(220,26%,27%)] duration-200 ease-linear"
                              onClick={() => {
                                setSelectedProduct(pro);
                                setIsPopupOpen(true); 
                              }}
                          >
                            <div className='w-[20%] items-center justify-center flex '>
                                <img src={pro.imageUrl} alt="" className="w-auto max-h-[110px] h-full mr-4" />
                            </div>

                              <div className=' w-[70%]'>
                                  <h3 className="text-[20px] mr-4 text-[#509CDB] font-semibold">{pro.productName}</h3>
                                  <p className="text-gray-300 text-[16px]">Kode Part: {pro.kodepart}</p>
                                  <p className="text-gray-300 text-[18px] mb-2">{pro.description}</p>
                                  <p className="text-white text-[16px]">Rp.{formatNumDot(pro.price)}</p>
                                  <p className="text-white text-[16px]">Stock: {pro.stock}</p>

                              </div>

                              <div className='flex h-full items-center justify-center w-[10%] flex-col'>
                              <MdOutlineAddBox size={40} className=' text-[#509CDB] cursor-pointer' 
                              onClick={(e) => {
                                e.stopPropagation();
                                addItemToCart(pro.productId,pro.productName,pro.price, quantities[pro.productId] || 1, pro.imageUrl, pro.description, pro.kodepart, pro.stock)
                                }} />
                                 
                                    <div className="flex items-center mt-2">
                                        <button
                                            className="text-white text-[20px] px-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuantityChange(pro.productId, -1)
                                            }}
                                        >
                                            -
                                        </button>
                                        <span className="text-white text-[20px] px-2">
                                            {quantities[pro.productId] || 1}
                                        </span>
                                        <button
                                            className="text-white text-[20px] px-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuantityChange(pro.productId, 1)}
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

            {/* Popup for product details */}
            {isPopupOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                    <div className="bg-[#465677] p-4 rounded-xl shadow-lg flex relative">
                        <button
                            className="absolute top-2 right-4 text-white text-[25px] hover:text-red-400"
                            onClick={() => setIsPopupOpen(false)} 
                        >
                            x
                        </button>
                        <div className='w-[50%] flex justify-center'>
                            <img src={selectedProduct.imageUrl} alt={selectedProduct.productName} className="w-full max-h-[400px] object-contain" />
                        </div>
                        <div className='w-[50%] p-4'>
                            <h2 className="text-2xl text-[#509CDB] font-semibold">{selectedProduct.productName} ({selectedBrand} {selectedCar})</h2>
                            <p className="text-gray-300">{selectedProduct.description}</p>
                            <p className="text-gray-300">{selectedProduct.kodepart}</p>
                            <p className="text-white">Rp.{formatNumDot(selectedProduct.price)}</p>
                            <p className="text-white">Stock: {selectedProduct.stock}</p>
                        </div>
                    </div>
                </div>
            )}
     
      </div>
      </div>
  );
};


export const HomePage = () => {
  return (
    <div className='bg-gray-800 min-h-screen font-rethink'>
      <Navbar activeLink={'products'}></Navbar>
      <Carousel></Carousel>
      <ProductCustomer></ProductCustomer>

      <Footer />
      
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
  )
}

export default HomePage
