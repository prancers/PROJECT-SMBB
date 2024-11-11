import React, { useState, useEffect } from 'react';
import { supabase } from '../../createClient';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EditBrand = () => {
  const [brandName, setBrandName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageBrand, setImageBrand] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const brandId = searchParams.get('brandId');
    const brandNameFromParams = searchParams.get('brandName');
    const imageUrlFromParams = searchParams.get('imageUrl');

    if (brandId) {
      setSelectedBrandId(brandId);
      setBrandName(brandNameFromParams || '');
      setImageBrand(imageUrlFromParams || '');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let publicUrl = imageBrand;

      if (imageFile) {
        const { error: deleteError } = await supabase.storage
          .from('Gambar')
          .remove([`BRAND/${imageFile.name}`]);

        if (deleteError && deleteError.message !== 'The resource does not exist') {
          console.error('Error deleting existing image:', deleteError);
          return;
        }

        const uniqueFileName = `${new Date().getTime()}_${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('Gambar')
          .upload(`BRAND/${uniqueFileName}`, imageFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          return;
        }

        const { data: urlData, error: urlError } = supabase.storage
          .from('Gambar')
          .getPublicUrl(`BRAND/${uniqueFileName}`);

        if (urlError) {
          console.error('Error fetching image URL:', urlError);
          return;
        }

        publicUrl = urlData.publicUrl;
      }

      if (!selectedBrandId) {
        console.error('Invalid brand ID');
        return;
      }

      const { error: updateError } = await supabase
        .from('Brand')
        .update({
          brandName: brandName,
          imageUrl: publicUrl, 
        })
        .eq('brandId', selectedBrandId); 

      if (updateError) {
        console.error('Error updating brand data:', updateError);
        return;
      }

      alert('Brand updated successfully!');
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
        <h2 className="text-2xl font-semibold text-center">Edit Brand</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="brandName" className="block text-gray-700 font-medium mb-2">
              Brand Name:
            </label>
            <input
              type="text"
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brand Name"
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
            {imageBrand && !imageFile && (
              <img src={imageBrand} alt="Brand" className="mt-4" style={{ height: '100px' }} />
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

export default EditBrand;
