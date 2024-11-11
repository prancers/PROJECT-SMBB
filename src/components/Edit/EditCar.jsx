import React, { useState, useEffect } from 'react';
import { supabase } from '../../createClient';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EditCar = () => {
  const [typeName, setTypeName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [brandName, setBrandName] = useState('');  // Add brandName state

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const typeId = searchParams.get('typeId');
    const typeNameFromParams = searchParams.get('typeName');
    const imageUrlFromParams = searchParams.get('imageUrl');
    const brandFromParams = searchParams.get('brand');  // Retrieve brand from query params

    if (typeId) {
      setSelectedTypeId(typeId);
      setTypeName(typeNameFromParams || '');
      setImageType(imageUrlFromParams || '');
      setBrandName(brandFromParams || '');  // Set brand name from URL parameter
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let publicUrl = imageType;
  
      // Step 1: Fetch the existing image URL from the database
      const { data: oldTypeData, error: fetchError } = await supabase
        .from('Type')
        .select('imageUrl')
        .eq('typeId', selectedTypeId)
        .single();
  
      if (fetchError) {
        console.error('Error fetching old image URL:', fetchError);
        return;
      }
  
      const oldImageUrl = oldTypeData?.imageUrl;
      console.log("Old Image URL:", oldImageUrl);  // Log old image URL
  
      if (imageFile) {
        // Step 2: Delete the existing image from storage if there's an old image
        if (oldImageUrl) {
          // Extract relative path from the full URL to match storage structure
          const oldImagePath = oldImageUrl.split('/storage/v1/object/public/Gambar/')[1];
          
          if (oldImagePath) {
            const { error: deleteError } = await supabase.storage
              .from('Gambar')
              .remove([oldImagePath]);
  
            if (deleteError && deleteError.message !== 'The resource does not exist') {
              console.error('Error deleting existing image:', deleteError);
              return;
            }
            console.log("Deleted old image:", oldImagePath);
          } else {
            console.error("Failed to extract old image path from URL");
          }
        }
  
        // Step 3: Generate a unique filename with timestamp
        const timestamp = Date.now();
        const filename = `${timestamp}_${imageFile.name}`;
  
        // Upload the new image with the unique filename
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Gambar')
          .upload(`TYPE/${brandName.toUpperCase()}/${filename}`, imageFile);
  
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          return;
        }
  
        // Step 4: Get the public URL for the uploaded image
        const { data: urlData, error: urlError } = supabase.storage
          .from('Gambar')
          .getPublicUrl(`TYPE/${brandName.toUpperCase()}/${filename}`);
  
        if (urlError) {
          console.error('Error fetching image URL:', urlError);
          return;
        }
  
        publicUrl = urlData.publicUrl;
      }
  
      if (!selectedTypeId) {
        console.error('Invalid type ID');
        return;
      }
  
      // Step 5: Update the car type record in the database
      const { error: updateError } = await supabase
        .from('Type')
        .update({
          typeName: typeName,
          imageUrl: publicUrl,
        })
        .eq('typeId', selectedTypeId);
  
      if (updateError) {
        console.error('Error updating car type data:', updateError);
        return;
      }
  
      alert('Car type updated successfully!');
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
        <h2 className="text-2xl font-semibold text-center">Edit Car Type</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="typeName" className="block text-gray-700 font-medium mb-2">
              Car Type Name:
            </label>
            <input
              type="text"
              id="typeName"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Car Type Name"
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
              <img src={imageType} alt="Car Type" className="mt-4" style={{ height: '100px' }} />
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

export default EditCar;
