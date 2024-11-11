import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../createClient';
import { useSearchParams } from 'react-router-dom';

const InputCar = () => {
    const [carName, setCarName] = useState('')
    const [imageFile, setImageFile] = useState('');

    const [searchParams] = useSearchParams();
    
    const brandId = searchParams.get('brandId');
    const brandName = searchParams.get('brandName');

    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      try {
        const timestamp = Date.now();
        const filename = `${timestamp}_${imageFile.name}`;
    
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Gambar')
          .upload(`TYPE/${brandName.toUpperCase()}/${filename}`, imageFile);
    
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          return;
        }
    
        const { data: urlData, error: urlError } = supabase.storage
          .from('Gambar')
          .getPublicUrl(`TYPE/${brandName.toUpperCase()}/${filename}`);
    
        if (urlError) {
          console.error('Error fetching image URL:', urlError);
          return;
        }
    
        const { error: insertError } = await supabase
          .from('Type')
          .insert([
            { typeName: carName, imageUrl: urlData.publicUrl, brandId: brandId } 
        ]);
    
        if (insertError) {
          console.error('Error inserting brand data:', insertError);
          return;
        }
    
        setCarName('');
        setImageFile(null);
    
        alert(`${brandName} car added successfully!`);
        navigate('/admin');
      } catch (error) {
        console.error('Error submitting form:', error);
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
        <h2 className="text-2xl font-semibold text-center items-center">Input <span className=' text-blue-500'>{brandName}</span> Type Cars</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="brandName" className="block text-gray-700 font-medium mb-2">
              Car Name:
            </label>
            <input
              type="text"
              id="carName"
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='Car Name'
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
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 items-center w-full font-semibold text-[18px]">
            Submit
          </button>
        </form>


      </div>
    </div>
  )
}

export default InputCar
