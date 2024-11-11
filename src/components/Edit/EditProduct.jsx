import React, { useState, useEffect } from 'react';
import { supabase } from '../../createClient';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EditProduct = () => {
  const [productName, setProductName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [kodepart, setKodepart] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      setSelectedProductId(productId);
      fetchProductData(productId);
    }
  }, [searchParams]);

  const fetchProductData = async (productId) => {
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .eq('productId', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
    } else if (data) {
      setProductName(data.productName || '');
      setImageType(data.imageUrl || '');
      setKodepart(data.kodepart || '');
      setDescription(data.description || '');
      setPrice(data.price || '');
      setStock(data.stock || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let publicUrl = imageType;

      if (imageFile) {
        // Delete old image if it exists
        if (imageType) {
          const oldImagePath = imageType.split('/storage/v1/object/public/Gambar/Product/')[1];
          if (oldImagePath) {
            await supabase.storage
              .from('Gambar')
              .remove([`Product/${oldImagePath}`]);
          }
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}_${imageFile.name}`;

        // Upload new image
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Gambar')
          .upload(`Product/${filename}`, imageFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          return;
        }

        // Get the public URL for the uploaded image
        const { data: urlData, error: urlError } = supabase.storage
          .from('Gambar')
          .getPublicUrl(`Product/${filename}`);

        if (urlError) {
          console.error('Error fetching image URL:', urlError);
          return;
        }

        publicUrl = urlData.publicUrl;
      }

      if (!selectedProductId) {
        console.error('Invalid product ID');
        return;
      }

      // Update product in the database
      const { error: updateError } = await supabase
        .from('Product')
        .update({
          productName,
          imageUrl: publicUrl,
          kodepart,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
        })
        .eq('productId', selectedProductId);

      if (updateError) {
        console.error('Error updating product data:', updateError);
        return;
      }

      alert('Product updated successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-rethink">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-[600px]">
        <div className="flex flex-row mb-6 justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Back to Admin Page
          </button>
        </div>
        <h2 className="text-2xl font-semibold text-center">Edit Product</h2>

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
              placeholder="Product Name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="kodepart" className="block text-gray-700 font-medium mb-2">
              Kodepart:
            </label>
            <input
              type="text"
              id="kodepart"
              value={kodepart}
              onChange={(e) => setKodepart(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kodepart"
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
              placeholder="Product Description"
              required
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
              placeholder="Product Price"
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
              placeholder="Product Stock"
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
            {imageType && !imageFile && (
              <img src={imageType} alt="Product" className="mt-4" style={{ height: '100px' }} />
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 items-center w-full font-semibold text-[18px]"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
