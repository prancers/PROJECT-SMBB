import React, { useState } from 'react';
import { supabase } from '../../createClient';
import { useNavigate, useSearchParams } from 'react-router-dom';

const InputCategory = () => {
  const [catName, setCatName] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const typeId = searchParams.get('typeId')

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('Category')
        .insert([
            { 
              typeId: typeId,
              categoryName: catName
            } 
        ]);

      if (error) {
        console.error('Error inserting category:', error.message);
        return;
      }

      alert('Category added successfully!');
      setCatName(''); 
      navigate('/admin'); 
    } catch (error) {
      console.error('Error submitting category:', error.message);
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
        <h2 className="text-2xl font-semibold text-center">Add New Category</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="catName" className="block text-gray-700 font-medium mb-2">
              Category Name:
            </label>
            <input
              type="text"
              id="catName"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
              required
            />
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

export default InputCategory;
