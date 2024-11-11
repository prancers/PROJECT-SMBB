import React, { useState, useEffect } from 'react';
import { supabase } from '../../createClient';
import { useNavigate, useSearchParams } from 'react-router-dom';

const InputProduct = () => {
  const [productName, setProductName] = useState('');
  const [kodepart, setKodepart] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [typeId, setTypeId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const typeParam = searchParams.get('typeId');
    const categoryParam = searchParams.get('categoryId');
    if (typeParam && categoryParam) {
      setTypeId(typeParam);
      setCategoryId(categoryParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = '';

      if (imageFile) {
        // Upload image to storage
        const timestamp = Date.now();
        const filename = `${timestamp}_${imageFile.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Gambar')
          .upload(`Product/${filename}`, imageFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError.message);
          return;
        }

        // Get public URL of the uploaded image
        const { data: urlData, error: urlError } = supabase.storage
          .from('Gambar')
          .getPublicUrl(`Product/${filename}`);

        if (urlError) {
          console.error('Error fetching image URL:', urlError.message);
          return;
        }

        imageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('Product')
        .insert([{
          categoryId : categoryId,
          productName,
          kodepart,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          imageUrl,
        }]);

      if (error) {
        console.error('Error inserting product:', error.message);
        return;
      }

      alert('Product added successfully!');
      navigate('/admin'); // Redirect back to admin or desired page
    } catch (error) {
      console.error('Error submitting product:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-rethink">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-[600px]">

        <div className=' flex flex-row mb-6 justify-between'>
            <button
            onClick={() => navigate('/admin')}
            className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Back to Admin Page
        </button>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-4">Add New Product</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="productName" className="block text-gray-700 font-medium mb-2">
              Product Name:
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="kodepart" className="block text-gray-700 font-medium mb-2">
              Kode Part:
            </label>
            <input
              type="text"
              id="kodepart"
              value={kodepart}
              onChange={(e) => setKodepart(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter kode part"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows="4"
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
              Price:
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="stock" className="block text-gray-700 font-medium mb-2">
              Stock:
            </label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter stock quantity"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
              Upload Image:
            </label>
            <input
              type="file"
              id="imageUrl"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full font-semibold text-[18px]"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputProduct;
