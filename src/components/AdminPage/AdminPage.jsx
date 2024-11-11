import React, { useEffect, useState } from 'react';
import logosmbb from '../../assets/image/logosmbb.jpeg'
import { supabase } from '../../createClient'; 
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { BiMenuAltLeft } from "react-icons/bi";
import { BiMenu } from "react-icons/bi";
import { MdOutlineEdit } from "react-icons/md";


const AdminPage = () => {
  const [activePage, setActivePage] = useState('dashboard'); 

  const navigate = useNavigate();

  const adminSession = JSON.parse(localStorage.getItem('adminSession'));

  useEffect(() => {
    if (!adminSession || !adminSession.isAdmin) {
      navigate('/loginadmin');
    }
  }, [adminSession, navigate]);

  const renderContent = () => {
    switch (activePage) {
      case 'products':
        return <Product />
      case 'customers':
        return <Customer />
      case 'Partners':
        return <Partners />
      case 'Pesanan':
        return <Pesanan />
      case 'adminAccount':
        return <AdminAccounts /> 
      case 'FinishedOrder':
        return <FinishedOrder />
      default:
        return <div className="p-8 text-white">Welcome to the Admin Dashboard</div>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/loginadmin');
  };

  function formatNumDot(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  const Product = () => {

    const [brands, setBrands] = useState([]);
    const [cars, setCars] = useState([]);
    const [category, setCategory] = useState([]);

    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState(null);
    const [imageBrand, setImageBrand] = useState(null)

    const [selectedCar, setSelectedCar] = useState(null);
    const [selectedCarId, setSelectedCarId] = useState(null);
    const [imageCar, setImageCar] = useState(null)


    const [selectedCategory, setselectedCategory] = useState(null);
    const [selectedCategoryId, setselectedCategoryId] = useState(null);

    const [product, setProduct] = useState([])
    const [kodepart, setKodepart] = useState(null)


    const [brandManip, setBrandManip] = useState(false)
    const [typeManip, setTypeManip] = useState(false)
    const [catManip, setCatManip] = useState(false)


    const navigate = useNavigate();

    const handleNavigation = (nav) => navigate(nav);
    
    // Add, edit, and delete navigation functions
    const inputCarsNavigation = (nav, selectedBrandId, selectedBrand) => {
        navigate(`${nav}?brandId=${selectedBrandId}&brandName=${encodeURIComponent(selectedBrand)}`);
    };

    const inputProductNav = (nav, typeId, catId) => {
        navigate(`${nav}?typeId=${typeId}&categoryId=${catId}`);
    };

    const editBrandNav = (id, name, image) => {
        if (!id || !name || !image) {
            toast.error('Select a Brand');
            return;
        }
        navigate(`/edit_brand?brandId=${encodeURIComponent(id)}&brandName=${encodeURIComponent(name)}&imageUrl=${encodeURIComponent(image)}`);
    };

    const editTypeNav = (id, name, image, brand) => {
        if (!id || !name || !image) {
            toast.error('Select a Brand');
            return;
        }
        navigate(`/edit_car?typeId=${encodeURIComponent(id)}&typeName=${encodeURIComponent(name)}&imageUrl=${encodeURIComponent(image)}&brand=${brand}`);
    };
  
        // Fetch brands
        useEffect(() => {
          const fetchBrands = async () => {
              const { data, error } = await supabase
                  .from('Brand')
                  .select('brandId, brandName, imageUrl');
              if (error) console.error('Error fetching brands:', error);
              else setBrands(data);
          };
          fetchBrands();
      }, []);

      // Fetch cars by brand
      useEffect(() => {
          if (selectedBrandId) {
              const fetchCarByBrand = async () => {
                  const { data, error } = await supabase
                      .from('Type')
                      .select('typeId, typeName, imageUrl')
                      .eq('brandId', selectedBrandId);
                  if (error) console.error('Error fetching cars:', error);
                  else setCars(data);
              };
              fetchCarByBrand();
          } else setCars([]);
      }, [selectedBrandId]);


      // mengambil category
      useEffect(() => {
        if (selectedCarId) {
            const fetchCategory = async () => {
                const { data, error } = await supabase
                    .from('Category')
                    .select('categoryId, categoryName')
                    .eq('typeId', selectedCarId)
                if (error) console.error("Error Fetching Categories:", error);
                else setCategory(data);
            };
            fetchCategory();
        } else setCategory([]);
      }, [selectedCarId]);

      const handleBrandClick = (brandId, brandName, imageUrl) => {
        setSelectedBrandId(brandId);
        setSelectedBrand(brandName);
        setImageBrand(imageUrl)
      };

      // Mengambil data product dari type dan category
      useEffect(() => {
        const fetchProductByKodepart = async (kodepart) => {
          const { data, error } = await supabase
            .from('Product')
            .select('*')
            .ilike('kodepart', `%${kodepart}%`)
            .eq('categoryId', selectedCategoryId);
    
          if (error) {
            console.error('Error fetching products by kodepart:', error);
          } else {
            setProduct(data);
          }
        };
    
        const fetchProductByTypeAndCategory = async () => {
          const { data, error } = await supabase
            .from('Product')
            .select('*')
            .eq('categoryId', selectedCategoryId);
    
          if (error) {
            console.error('Error fetching products:', error);
          } else {
            setProduct(data);
          }
        };
    
        if (kodepart) {
          fetchProductByKodepart(kodepart);
        } else if (selectedCarId && selectedCategoryId) {
          fetchProductByTypeAndCategory();
        }
      }, [kodepart, selectedCarId, selectedCategoryId]);
      
      // handle delete brand
      const deleteBrand = async (selectedBrandId) => {
        try {
          const { data: brandData, error: fetchError } = await supabase
            .from('Brand')
            .select('imageUrl')
            .eq('brandId', selectedBrandId)
            .single();
      
          if (fetchError) {
            console.error('Error fetching brand data:', fetchError.message);
            return;
          }
      
          if (!brandData || !brandData.imageUrl) {
            console.error('No image URL found for the selected brand');
            return;
          }
      
          const imagePath = brandData.imageUrl.split('/').slice(-2).join('/'); 
      
          const { error: deleteImageError } = await supabase.storage
            .from('Gambar')
            .remove([imagePath]);
      
          if (deleteImageError) {
            console.error('Error deleting image from storage:', deleteImageError.message);
            return;
          }
      
          const { error: deleteBrandError } = await supabase
            .from('Brand')
            .delete()
            .eq('brandId', selectedBrandId);
      
          if (deleteBrandError) {
            console.error('Error deleting brand:', deleteBrandError.message);
          } else {
            console.log('Brand and image deleted successfully');
          }
        } catch (error) {
          console.error('Unexpected error deleting brand:', error);
        }
      };

      // handle delete car / type
      const deleteType = async (selectedCarId) => {
        try {
          // Step 1: Retrieve the car type data, including the image URL, from the database
          const { data: carData, error: fetchError } = await supabase
            .from('Type')
            .select('imageUrl')
            .eq('typeId', selectedCarId)
            .single();
      
          if (fetchError) {
            console.error('Error fetching car type data:', fetchError.message);
            return;
          }
      
          // Ensure carData contains a valid image URL
          if (!carData || !carData.imageUrl) {
            console.error('No image URL found for the selected car type');
            return;
          }
      
          // Step 2: Extract the relative image path from the URL
          const urlParts = carData.imageUrl.split('/');  // Split by "/"
          const imagePath = urlParts.slice(urlParts.indexOf('Gambar') + 1).join('/');  // Get the path after "Gambar"
      
          console.log("Image Path to Delete:", imagePath);  // Log for verification
      
          // Step 3: Delete the image from the storage bucket
          const { error: deleteImageError } = await supabase.storage
            .from('Gambar')
            .remove([imagePath]);
      
          if (deleteImageError) {
            console.error('Error deleting image from storage:', deleteImageError.message);
            return;
          }
      
          // Step 4: Delete the car type record from the database
          const { error: deleteTypeError } = await supabase
            .from('Type')
            .delete()
            .eq('typeId', selectedCarId);
      
          if (deleteTypeError) {
            console.error('Error deleting car type:', deleteTypeError.message);
          } else {
            console.log('Car type and image deleted successfully');
          }
        } catch (error) {
          console.error('Unexpected error deleting car type:', error);
        }
      };


      const deleteCategory = async (selectedCategoryId) => {
        try {
          const { error } = await supabase
            .from('Category')
            .delete()
            .eq('categoryId', selectedCategoryId);
      
          if (error) {
            console.error("Error while deleting category:", error.message);
          } else {
            console.log("Category deleted successfully!");
          }
        } catch (error) {
          console.error("Unexpected error while deleting category:", error);
        }
      };

      const handleDeleteProduct = async (productId) => {
      if (!productId) return;

      const confirmDelete = window.confirm('Are you sure you want to delete this product?');
      if (!confirmDelete) return;

      try {
        // Fetch the product to get the image URL (if any)
        const { data: productData, error: fetchError } = await supabase
          .from('Product')
          .select('imageUrl')
          .eq('productId', productId)
          .single();

        if (fetchError) {
          console.error('Error fetching product data:', fetchError);
          return;
        }

        // Remove image from storage if it exists
        if (productData && productData.imageUrl) {
          const imagePath = productData.imageUrl.split('/storage/v1/object/public/Gambar/Product/')[1];
          if (imagePath) {
            const { error: removeError } = await supabase.storage
              .from('Gambar')
              .remove([`Product/${imagePath}`]);

            if (removeError) {
              console.error('Error deleting image from storage:', removeError);
            }
          }
        }

        // Delete product from database
        const { error: deleteError } = await supabase
          .from('Product')
          .delete()
          .eq('productId', productId);

        if (deleteError) {
          console.error('Error deleting product:', deleteError);
          return;
        }

        alert('Product deleted successfully!');
        // Optional: refresh the product list or redirect, if needed
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    };
      
    return(
        <div className="p-8 text-white font-rethink">

          <div className=' mb-4 flex flex-row items-center '>
              <h1 className="text-2xl mr-4">Choose Car Brands</h1>

              <div className=' border-[1px] border-gray-500 flex flex-row p-1 rounded-lg'>
                {brandManip ? 
                <div className=' ease-linear duration-500 flex flex-row'>
                  <BiMenuAltLeft size={40} className=' mr-4 cursor-pointer' onClick={() => setBrandManip(!brandManip)} />
                  <button className=' px-3 py-1 mr-4 bg-[#509CDB] rounded-lg hover:bg-[hsl(207,66%,30%)]' onClick={() => handleNavigation('/input_brand')}>Add More Brand</button>
                  
                  <button className=' px-3 py-1 mr-4 bg-amber-500 rounded-lg hover:bg-amber-700' 
                    onClick={() => editBrandNav(selectedBrandId,selectedBrand,imageBrand)}>
                    Edit Brand {selectedBrand}
                  </button>

                  <button className=' px-3 py-1 bg-red-500 rounded-lg hover:bg-red-700' 
                      onClick={() => {
                        deleteBrand(selectedBrandId)
                        setBrands([]);
                      }}
                      >
                      Delete {selectedBrand}
                  </button>
                </div> : <BiMenu size={40} className=' cursor-pointer' onClick={() => setBrandManip(!brandManip)} />
                  }
              </div>


          </div>
          <div className="flex flex-wrap gap-4">
            {brands.map((brand, index) => (
              <div
                key={index}
                className={`p-4 rounded shadow-lg flex flex-col items-center justify-center w-40 cursor-pointer mb-8
                ${selectedBrand === brand.brandName ? 'bg-[#509CDB] ease-in-out duration-200' : 'bg-[#465677]'}`}
                onClick={() => handleBrandClick(brand.brandId, brand.brandName, brand.imageUrl)}
              >
                <img src={brand.imageUrl} alt={brand.brandName} className=' w-auto max-h-[90px] h-full mb-4'/>
                <span className="text-center text-[#1A202C] font-semibold uppercase">{brand.brandName}</span>
              </div>
            ))}
          </div>

          {/* ============= SHOWING TYPE ============ */}
          {selectedBrandId && ( // Only show if a brand is selected
            <div className="mt-8 flex flex-col">
            <div className={` mb-4 flex flex-row items-center `}>
                <h2 className="text-2xl mr-4">Available {selectedBrand} Cars Sparepart</h2>
                <div className="border-[1px] border-gray-500 flex flex-row p-1 rounded-lg">
                  {typeManip ? (
                    <div className="ease-linear duration-500 flex flex-row items-center">
                      <BiMenuAltLeft
                        size={40}
                        className="mr-4 cursor-pointer"
                        onClick={() => setTypeManip(!typeManip)}
                      />
                      <button
                        className="px-3 py-1 mr-4 bg-[#509CDB] rounded-lg hover:bg-[hsl(207,66%,30%)]"
                        onClick={() => inputCarsNavigation('/input_cars', selectedBrandId, selectedBrand)}
                      >
                        Add More {selectedBrand} Cars
                      </button>
                      <button
                        className="px-3 py-1 mr-4 bg-amber-500 rounded-lg hover:bg-amber-700"
                        onClick={() => editTypeNav(selectedCarId, selectedCar, imageCar, selectedBrand)}
                      >
                        Edit {selectedCar}
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 rounded-lg hover:bg-red-700"
                        onClick={() => deleteType(selectedCarId)}
                      >
                        Delete {selectedCar}
                      </button>
                    </div>
                  ) : (
                    <BiMenu
                      size={40}
                      className="cursor-pointer"
                      onClick={() => setTypeManip(!typeManip)}
                    />
                  )}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 items-start mb-8">
              {cars.map((car) => (
                  <div
                  key={car.typeId}
                  className={`bg-[#465677] p-4 rounded shadow-lg flex flex-col items-start justify-between w-40 h-[200px] cursor-pointer ${selectedCarId === car.typeId ? 'bg-[#509CDB] ease-in-out duration-200' : ''}`}
                  onClick={() => {
                    setSelectedCarId(car.typeId); 
                    setSelectedCar(car.typeName)
                    setImageCar(car.imageUrl);
                  }} 
                  >
                  <img 
                      src={car.imageUrl} 
                      alt={car.typeName} 
                      className="w-full h-auto mb-4" 
                  />
                  <span className="text-center text-white text-[18px]">{car.typeName}</span>
                  </div>
              ))}
              </div>
            </div>
            )}

          {/* ============= SHOWING CATEGORY ============ */}
          {selectedCarId && (
              <div className="mt-8">
                <div className=' flex flex-row mb-4 items-center'>
                <h2 className="text-2xl mr-4">Available Sparepart Categories for {selectedCar}</h2>
                  <div className="border-[1px] border-gray-500 flex flex-row p-1 rounded-lg">
                    {catManip ? (
                      <div className="ease-linear duration-500 flex flex-row items-center">
                        <BiMenuAltLeft
                          size={40}
                          className="mr-4 cursor-pointer"
                          onClick={() => setCatManip(!catManip)}
                        />
                        <button
                          className="px-3 py-2 mr-4 bg-[#509CDB] rounded-lg hover:bg-[hsl(207,66%,30%)]"
                          onClick={() => handleNavigation(`/input_category?typeId=${selectedCarId}`)}
                        >
                          Add Category
                        </button>
                        <button
                          className="px-3 py-2 bg-red-500 rounded-lg hover:bg-red-700"
                          onClick={() => deleteCategory(selectedCategoryId)}
                        >
                          Delete {selectedCategory}
                        </button>
                      </div>
                    ) : (
                      <BiMenu
                        size={40}
                        className="cursor-pointer"
                        onClick={() => setCatManip(!catManip)}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-start">
                  {category.map((cat) => (
                    <div
                      key={cat.categoryId}
                      className={`bg-[#465677]  mb-8 p-4 rounded shadow-lg flex flex-col items-start justify-between w-40 h-fit cursor-pointer ${selectedCategoryId === cat.categoryId ? 'bg-[#509CDB]': '' }`}
                      onClick={() => {
                        setselectedCategory(cat.categoryName);
                        setselectedCategoryId(cat.categoryId)
                      }}
                    >
                      <span className="text-center text-white text-[18px]">{cat.categoryName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            

            {/* ============= SHOWING PRODUCT BY BRAND, TYPE, CATEGORY ============ */}
            {selectedCategory && ( 
              <div className="mt-8">

                <div className=' flex flex-row items-center mb-4'>
                  <h2 className="text-[18px] mr-4">Search by Kodepart</h2>
                  <input
                    type="text"
                    placeholder="Kodepart"
                    className="py-2 px-3 text-[18px] rounded-lg bg-[hsl(220,26%,57%)] text-black"
                    value={kodepart}
                    onChange={(e) => setKodepart(e.target.value)}
                  />
                </div>

                <div className=' mb-4 flex flex-row items-center '>
                  <h2 className="text-2xl mr-4">Available Products for {selectedCategory} {selectedCar}</h2>
                  <button 
                    className=' px-3 py-2 mr-4 bg-[#509CDB] rounded-lg hover:bg-[hsl(207,66%,30%)]' 
                    onClick={() => inputProductNav('/input_product', selectedCarId, selectedCategoryId)}>Add New Products {selectedCategory} {selectedCar}
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 items-start flex-col w-full">
                  {product.map((pro) => (
                    <div
                      key={pro.productId}
                      className={`bg-[#465677] p-4 rounded shadow-lg flex flex-row items-start h-fit  w-[60%] `}
                      onClick={() => {
                      }}
                    >
                      <img src={pro.imageUrl} alt="" className='w-auto max-h-[110px] h-full mr-4' />

                      <div className=' flex flex-row w-full justify-between'>
                          <div className=' flex flex-col justify-center'>
                            <div>
                              <span className=" text-[20px] mr-4 text-[#509CDB] font-semibold">{pro.productName}</span>
                              <span className=" text-gray-300 text-[16px]">Kode Part : {pro.kodepart}</span>
                            </div>
                            <span className=" text-gray-300 text-[18px] mb-2">{pro.description}</span>
                            <span className=" text-white text-[16px]">Rp.{formatNumDot(pro.price)}</span>
                            <span className=" text-white text-[16px]">Stock : {pro.stock}</span>

                          </div>

                          <div className=' flex flex-col items-center justify-between'>
                            <FaRegEdit size={25} className=' cursor-pointer'
                              onClick={() => {
                                navigate(`/EditProduct?productId=${pro.productId}`)
                              }}
                            />
                            <MdOutlineDelete size={32} className=' cursor-pointer' color='#EF4444'
                              onClick={() => {
                                handleDeleteProduct(pro.productId)
                              }}
                            />
                          </div>
                      </div>


                    </div>
                  ))}
                </div>
              </div>
            )}
            <ToastContainer />
        </div>
    )
  };

  const Customer = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            const { data, error } = await supabase
                .from('Customer')
                .select('customerId, username, email, phoneNumber, address');
            if (!error) setCustomers(data);
            else console.error('Error fetching customers:', error);
        };

        fetchCustomers();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 text-white">
            <h2 className="text-2xl mb-4">Customers</h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by username"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="py-2 px-4 w-[500px] rounded-lg bg-gray-700 text-white"
                />
            </div>

            <table className="min-w-full bg-gray-800 rounded-lg text-center">
                <thead>
                    <tr>
                        <th className="p-4 border-b border-gray-600">Customer ID</th>
                        <th className="p-4 border-b border-gray-600">Username</th>
                        <th className="p-4 border-b border-gray-600">Email</th>
                        <th className="p-4 border-b border-gray-600">Phone Number</th>
                        <th className="p-4 border-b border-gray-600">Address</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCustomers.map((customer) => (
                        <tr key={customer.customerId}>
                            <td className="p-4 border-b border-gray-700">{customer.customerId}</td>
                            <td className="p-4 border-b border-gray-700">{customer.username}</td>
                            <td className="p-4 border-b border-gray-700">{customer.email}</td>
                            <td className="p-4 border-b border-gray-700">{customer.phoneNumber}</td>
                            <td className="p-4 border-b border-gray-700">{customer.address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  };

  const Partners = () => {
    const [partners, setPartners] = useState([]);
    const [partnerName, setPartnerName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState('');
    const [editingPartnerId, setEditingPartnerId] = useState(null); // Track which partner is being edited
    const [originalPartnerName, setOriginalPartnerName] = useState(''); // Store original partner name for editing
  
    const timestamp = Date.now();
  
    useEffect(() => {
      const fetchPartners = async () => {
        const { data, error } = await supabase
          .from('partner')
          .select('partnerId, partnerName, imageUrl');
        if (!error) setPartners(data);
        else console.error('Error fetching partners:', error);
      };
  
      fetchPartners();
    }, []);
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setImageFile(file);
    };
  
    const handleDelete = async (partnerId) => {
      const { error } = await supabase
        .from('partner')
        .delete()
        .eq('partnerId', partnerId);
  
      if (error) {
        console.error('Error deleting partner:', error);
        setError('Failed to delete partner.');
      } else {
        // Remove the partner from the local state
        setPartners(partners.filter(partner => partner.partnerId !== partnerId));
      }
    };
  
    const handleAddOrUpdatePartner = async () => {
      if (!partnerName || !imageFile) {
        setError('Please enter a partner name and select an image.');
        return;
      }
  
      const filename = `${timestamp}_${imageFile.name}`;
      const filePath = `/PARTNER/${filename}`;
  
      try {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('Gambar') // Ensure 'Gambar' is your actual bucket name
          .upload(filePath, imageFile);
  
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError('Failed to upload image.');
          return;
        }
  
        const { data: { publicUrl } } = supabase
          .storage
          .from('Gambar')
          .getPublicUrl(filePath);
  
        if (editingPartnerId) {
          // Update existing partner
          const { error } = await supabase
            .from('partner')
            .update({ partnerName, imageUrl: publicUrl })
            .eq('partnerId', editingPartnerId);
  
          if (error) {
            console.error('Error updating partner:', error);
            setError('Failed to update partner.');
          } else {
            // Update local state
            setPartners(partners.map(partner =>
              partner.partnerId === editingPartnerId
                ? { ...partner, partnerName, imageUrl: publicUrl }
                : partner
            ));
            resetForm();
          }
        } else {
          // Insert new partner
          const { data, error } = await supabase
            .from('partner')
            .insert([{ partnerName, imageUrl: publicUrl }])
            .select();
  
          if (error) {
            console.error('Error adding partner:', error);
            setError('Failed to add partner.');
          } else {
            setPartners([...partners, ...data]);
            resetForm();
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred.');
      }
    };
  
    const resetForm = () => {
      setPartnerName('');
      setImageFile(null);
      setEditingPartnerId(null);
      setOriginalPartnerName('');
      setError('');
    };
  
    const handleEdit = (partner) => {
      setPartnerName(partner.partnerName);
      setOriginalPartnerName(partner.partnerName);
      setEditingPartnerId(partner.partnerId);
      setImageFile(null); // Reset the image file (optional)
    };
  
    return (
      <div className="p-8 text-white">
        <h2 className="text-2xl mb-4">Partners</h2>
  
        {/* Input for Partner Name and Image File */}
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Partner Name"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="py-2 px-4 w-[30%] rounded-lg bg-gray-700 text-white"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="py-2 px-4 w-[30%] rounded-lg bg-gray-700 text-white"
            accept="image/*"
          />
          <button
            onClick={handleAddOrUpdatePartner}
            className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            {editingPartnerId ? 'Update Partner' : 'Add Partner'}
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
  
        {/* Partner Table */}
        <table className="min-w-full bg-gray-800 rounded-lg text-center">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-600">Partner ID</th>
              <th className="p-4 border-b border-gray-600">Partner Name</th>
              <th className="p-4 border-b border-gray-600">Image URL</th>
              <th className="p-4 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner, index) => (
              <tr key={partner.partnerId}>
                <td className="p-4 border-b border-gray-700">{index+1}</td>
                <td className="p-4 border-b border-gray-700">{partner.partnerName}</td>
                <td className="p-4 border-b border-gray-700 flex justify-center items-center">
                  <img src={partner.imageUrl} alt={partner.partnerName} className="w-20 h-auto rounded" />
                </td>
                <td className="p-4 border-b border-gray-700">
                  <button
                    onClick={() => handleEdit(partner)}
                    className="text-yellow-500 hover:text-yellow-700 mr-8"
                    aria-label="Edit partner"
                  >
                    <MdOutlineEdit size={33} />
                  </button>
                  <button onClick={() => handleDelete(partner.partnerId)} className="text-red-500 hover:text-red-700">
                    <MdOutlineDelete size={35} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const AdminAccounts = () => {
    const [admins, setAdmins] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [editingAdminId, setEditingAdminId] = useState(null); // Track which admin is being edited
    const [originalUsername, setOriginalUsername] = useState(''); // Store original username for editing

    useEffect(() => {
      const fetchAdmins = async () => {
        const { data, error } = await supabase
          .from('Admin')
          .select('id, username');
        if (!error) setAdmins(data);
        else console.error('Error fetching admins:', error);
      };

      fetchAdmins();
    }, []);

    const handleAddOrUpdateAdmin = async () => {
      if (!username || !password) {
        setError('Please enter both a username and password.');
        return;
      }

      if (editingAdminId) {
        // Update existing admin
        const { error } = await supabase
          .from('Admin')
          .update({ username, password }) // Password handling should ideally include hashing
          .eq('id', editingAdminId);

        if (error) {
          console.error('Error updating admin:', error);
          setError('Failed to update admin.');
        } else {
          // Update local state
          setAdmins(admins.map(admin =>
            admin.id === editingAdminId ? { ...admin, username } : admin
          ));
          resetForm();
        }
      } else {
        // Insert new admin
        const { data, error } = await supabase
          .from('Admin')
          .insert([{ username, password }])
          .select('id, username');

        if (error) {
          console.error('Error adding admin:', error);
          setError('Failed to add admin.');
        } else {
          setAdmins([...admins, ...data]);
          resetForm();
        }
      }
    };

    const handleDeleteAdmin = async (id) => {
      const { error } = await supabase
        .from('Admin')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting admin:', error);
        setError('Failed to delete admin.');
      } else {
        setAdmins(admins.filter(admin => admin.id !== id));
      }
    };

    const handleEdit = (admin) => {
      setUsername(admin.username);
      setOriginalUsername(admin.username);
      setEditingAdminId(admin.id);
      setPassword(''); // Optionally reset password if editing
    };

    const resetForm = () => {
      setUsername('');
      setPassword('');
      setEditingAdminId(null);
      setOriginalUsername('');
      setError('');
    };

    return (
      <div className="p-8 text-white">
        <h2 className="text-2xl mb-4">Admin Accounts</h2>

        {/* Input for Username and Password */}
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="py-2 px-4 w-1/3 rounded-lg bg-gray-700 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-2 px-4 w-1/3 rounded-lg bg-gray-700 text-white"
          />
          <button
            onClick={handleAddOrUpdateAdmin}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            {editingAdminId ? 'Update Admin' : 'Add Admin'}
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Admin Table */}
        <table className="min-w-full bg-gray-800 rounded-lg text-center">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-600">ID</th>
              <th className="p-4 border-b border-gray-600">Username</th>
              <th className="p-4 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="p-4 border-b border-gray-700">{admin.id}</td>
                <td className="p-4 border-b border-gray-700">{admin.username}</td>
                <td className="p-4 border-b border-gray-700">
                  <button onClick={() => handleEdit(admin)} className="text-yellow-500 hover:text-yellow-700 mr-4">
                    <MdOutlineEdit size={24} />
                  </button>
                  <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 hover:text-red-700">
                    <MdOutlineDelete size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const Pesanan = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchOrders = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('Order')
        .select(`
          orderId, statusOrder, statusNo, tanggalOrder,
          detailOrder (productId, productName, quantity, priceTimesQuantity),
          Customer (email)
        `)
        .order('orderId', { ascending: false });

      if (orderError) {
        console.error('Error fetching orders:', orderError);
        return;
      }

      // Filter orders based on date range and exclude completed orders (statusNo 4)
      const filteredOrders = orderData.filter(order => {
        const orderDate = new Date(order.tanggalOrder);
        const isWithinDateRange =
          (!startDate || orderDate >= new Date(startDate)) &&
          (!endDate || orderDate <= new Date(endDate));
        return isWithinDateRange && order.statusNo !== 4;
      });

      // Fetch payment and shipment data
      const ordersWithDetails = await Promise.all(
        filteredOrders.map(async (order) => {
          const { data: paymentData, error: paymentError } = await supabase
            .from('Payment')
            .select('paymentDate, paymentProof, paymentStatus, paymentId')
            .eq('orderId', order.orderId)
            .single();

          if (paymentError) {
            console.error('Error fetching payment:', paymentError);
            return { ...order, Payment: null, Pengiriman: null };
          }

          let shipmentData = null;
          if (paymentData?.paymentId) {
            const { data: shipment, error: shipmentError } = await supabase
              .from('Pengiriman')
              .select('namaPenerima, alamatPenerima, phoneNumber, tanggalMenerima')
              .eq('paymentId', paymentData.paymentId)
              .single();

            if (shipmentError) console.error('Error fetching shipment:', shipmentError);
            shipmentData = shipment || null;
          }

          return { ...order, Payment: paymentData, Pengiriman: shipmentData };
        })
      );

      setOrders(ordersWithDetails);
    };

    useEffect(() => {
      fetchOrders();
    }, [startDate, endDate]);

    const handleViewDetails = (order) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedOrder(null);
    };

    const updateOrderStatus = async (orderId, newStatusNo, newStatusOrder) => {
      try {
        const updates = {
          statusNo: newStatusNo,
          statusOrder: newStatusOrder,
        };

        if (newStatusNo === 4 && selectedOrder?.Pengiriman) {
          const today = new Date().toISOString().split('T')[0]; // Set today’s date in "yyyy-mm-dd" format
          const { error: shipmentError } = await supabase
            .from('Pengiriman')
            .update({ tanggalPengiriman: today })
            .eq('paymentId', selectedOrder.Payment.paymentId);

          if (shipmentError) throw shipmentError;
        }

        if (newStatusNo === 3) {
          const { data: detailOrders, error: detailOrderFetchError } = await supabase
            .from('detailOrder')
            .select('productId, quantity')
            .eq('orderId', orderId);

          if (detailOrderFetchError) throw detailOrderFetchError;

          for (const detail of detailOrders) {
            const { productId, quantity } = detail;
            const { data: productData, error: productFetchError } = await supabase
              .from('Product')
              .select('stock')
              .eq('productId', productId)
              .single();

            if (productFetchError) throw productFetchError;
            const newStock = productData.stock - quantity;

            const { error: stockError } = await supabase
              .from('Product')
              .update({ stock: newStock })
              .eq('productId', productId);

            if (stockError) throw stockError;
          }

          const { error: paymentError } = await supabase
            .from('Payment')
            .update({ paymentStatus: 'payment received' })
            .eq('orderId', orderId);

          if (paymentError) throw paymentError;
        }

        const { error: orderError } = await supabase
          .from('Order')
          .update(updates)
          .eq('orderId', orderId);

        if (orderError) throw orderError;

        alert(`Order status updated to "${newStatusOrder}"`);
        closeModal();
        fetchOrders();
      } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
      }
    };

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>

        <div className="mb-4">
          <label className="mr-2">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-2 py-1 mr-4 text-black"
          />
          <label className="mr-2">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-2 py-1 text-black"
          />
        </div>

        <div>
          {orders.map((order) => (
            <div key={order.orderId} className="border-b py-2 flex justify-between">
              <div>
                <p>Order ID: {order.orderId}</p>
                <p>Status: {order.statusOrder}</p>
                <p>Order Date: {order.tanggalOrder}</p>
                <p>Customer Email: {order.Customer?.email || 'N/A'}</p>
              </div>
              <button
                onClick={() => handleViewDetails(order)}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white text-black p-6 rounded-lg w-3/4 max-w-2xl">
              <button onClick={closeModal} className="float-right text-xl font-bold">×</button>
              <h2 className="text-xl font-semibold mb-2">Order Details for #{selectedOrder.orderId}</h2>

              <h3 className="font-semibold">Shipping Information:</h3>
              <p>Recipient Name: {selectedOrder.Pengiriman?.namaPenerima || 'N/A'}</p>
              <p>Address: {selectedOrder.Pengiriman?.alamatPenerima || 'N/A'}</p>
              <p>Phone: {selectedOrder.Pengiriman?.phoneNumber || 'N/A'}</p>

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
                      className="w-[380px] h-auto mt-2"
                    />
                  ) : (
                    <p>No proof of payment uploaded.</p>
                  )}
                  <p className="mt-1">Payment Status: {selectedOrder.Payment.paymentStatus}</p>
                </>
              ) : (
                <p>No payment information available.</p>
              )}

              <div className="mt-4">
                {selectedOrder.statusNo === 2 && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 3, 'Packing and delivering')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Set to Packing and Delivering
                  </button>
                )}
                {selectedOrder.statusNo === 3 && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 4, 'Order completed')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const FinishedOrder = () => {
    const [finishedOrders, setFinishedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchFinishedOrders = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('Order')
        .select(`
          orderId, statusOrder, statusNo, tanggalOrder,
          detailOrder (productId, productName, quantity, priceTimesQuantity),
          Customer (email)
        `)
        .eq('statusNo', 4) // Only fetch finished orders
        .order('orderId', { ascending: false });

      if (orderError) {
        console.error('Error fetching orders:', orderError);
        return;
      }

      // Filter orders based on date range
      const filteredOrders = orderData.filter(order => {
        const orderDate = new Date(order.tanggalOrder);
        const isWithinDateRange =
          (!startDate || orderDate >= new Date(startDate)) &&
          (!endDate || orderDate <= new Date(endDate));
        return isWithinDateRange;
      });

      // Fetch payment and shipment data
      const ordersWithDetails = await Promise.all(
        filteredOrders.map(async (order) => {
          const { data: paymentData, error: paymentError } = await supabase
            .from('Payment')
            .select('paymentDate, paymentProof, paymentStatus, paymentId')
            .eq('orderId', order.orderId)
            .single();

          if (paymentError) {
            console.error('Error fetching payment:', paymentError);
            return { ...order, Payment: null, Pengiriman: null };
          }

          let shipmentData = null;
          if (paymentData?.paymentId) {
            const { data: shipment, error: shipmentError } = await supabase
              .from('Pengiriman')
              .select('namaPenerima, alamatPenerima, phoneNumber, tanggalMenerima')
              .eq('paymentId', paymentData.paymentId)
              .single();

            if (shipmentError) console.error('Error fetching shipment:', shipmentError);
            shipmentData = shipment || null;
          }

          return { ...order, Payment: paymentData, Pengiriman: shipmentData };
        })
      );

      setFinishedOrders(ordersWithDetails);
    };

    useEffect(() => {
      fetchFinishedOrders();
    }, [startDate, endDate]);

    const handleViewDetails = (order) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedOrder(null);
    };

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Finished Orders</h1>

        <div className="mb-4">
          <label className="mr-2">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-2 py-1 mr-4 text-black"
          />
          <label className="mr-2">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-2 py-1 text-black"
          />
        </div>

        <div>
          {finishedOrders.map((order) => (
            <div key={order.orderId} className="border-b py-2 flex justify-between">
              <div>
                <p>Order ID: {order.orderId}</p>
                <p>Status: {order.statusOrder}</p>
                <p>Order Date: {order.tanggalOrder}</p>
                <p>Customer Email: {order.Customer?.email || 'N/A'}</p>
              </div>
              <button
                onClick={() => handleViewDetails(order)}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white text-black p-6 rounded-lg w-3/4 max-w-2xl">
              <button onClick={closeModal} className="float-right text-xl font-bold">×</button>
              <h2 className="text-xl font-semibold mb-2">Order Details for #{selectedOrder.orderId}</h2>

              <h3 className="font-semibold">Shipping Information:</h3>
              <p>Recipient Name: {selectedOrder.Pengiriman?.namaPenerima || 'N/A'}</p>
              <p>Address: {selectedOrder.Pengiriman?.alamatPenerima || 'N/A'}</p>
              <p>Phone: {selectedOrder.Pengiriman?.phoneNumber || 'N/A'}</p>

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
                      className="w-[380px] h-auto mt-2"
                    />
                  ) : (
                    <p>No proof of payment uploaded.</p>
                  )}
                  <p className="mt-1">Payment Status: {selectedOrder.Payment.paymentStatus}</p>
                </>
              ) : (
                <p>No payment information available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  
  return (
    <div className="flex w-full font-rethink">

      <div className="min-h-screen w-[17%] bg-[#152259] text-white flex flex-col">

        <img src={logosmbb} alt="" className=' px-4 py-4' />

        <div className="p-4 text-xl font-semibold bg-[#152259]">Selalu Maju Bersama Batam</div>

        <ul className="flex-grow p-4">
          <li className="mb-4">
            <button
              onClick={() => setActivePage('products')}
              className={`block w-full text-left py-2 px-4 hover:bg-gray-700 rounded ${activePage === 'products' ? 'bg-[#509CDB]' : ''}`}
            >
              Products
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => setActivePage('customers')}
              className={`block w-full text-left py-2 px-4 hover:bg-gray-700 rounded ${activePage === 'customers' ? 'bg-[#509CDB]' : ''}`}
            >
              Customers
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => setActivePage('Pesanan')}
              className={`block w-full text-left py-2 px-4 hover:bg-gray-700 rounded ${activePage === 'Pesanan' ? 'bg-[#509CDB]' : ''}`}
            >
              Orders
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => setActivePage('FinishedOrder')}
              className={`block w-full text-left py-2 px-4 hover:bg-gray-700 rounded ${activePage === 'FinishedOrder' ? 'bg-[#509CDB]' : ''}`}
            >
              Finished Order
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => setActivePage('Partners')}
              className={`block w-full text-left py-2 px-4 hover:bg-gray-700 rounded ${activePage === 'Partners' ? 'bg-[#509CDB]' : ''}`}
            >
              Partners
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => setActivePage('adminAccount')}
              className={`block w-full text-left py-2 px-4 hover:bg-gray-700 rounded ${activePage === 'adminAccount' ? 'bg-[#509CDB]' : ''}`}
            >
              Admin Account
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={handleLogout}
              className={`block w-full text-left py-2 px-4 hover:bg-gray-700 rounded `}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="flex bg-[#1A202C] text-white flex-col flex-grow">
        <h2 className=' p-4'>Admin : {adminSession ? adminSession.username.toUpperCase() : ''}</h2>
        {renderContent()}
      </div>

    </div>
  );
};

export default AdminPage;
