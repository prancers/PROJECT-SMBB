import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';
import { Navbar } from '../HomePage/HomePage';
import whatsapp_logo from '../../assets/image/whatsapp.png'

const ContactUs = () => {
  const [admins, setAdmins] = useState([]);
  
  useEffect(() => {
    const fetchAdmins = async () => {
      const { data, error } = await supabase
        .from('Admin')
        .select('username'); 

      if (error) {
        console.error('Error fetching admins:', error);
      } else {
        setAdmins(data);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className=' bg-gray-800 min-h-screen font-rethink'>
    <Navbar activeLink={'contactus'}></Navbar>
    <div className="flex container mx-auto p-4 bg-gray-800">
      <div className="w-3/5 h-96">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15956.260923045837!2d104.0851572!3d1.1132462!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d98967fd7afab1%3A0x9ed8e86a795f2931!2sPT%20Selalu%20Maju%20Bersama%20Batam!5e0!3m2!1sen!2sid!4v1730295463179!5m2!1sen!2sid"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />

      </div>

      <div className="w-2/5 ml-4">
        <h2 className="text-xl font-bold mb-4 text-white">Contact Admins</h2>
        <div className="bg-white  rounded-lg p-4">

          <div className="mt-4">
            <div className=' flex flex-row items-center w-full'>
              <p className="text-gray-600 mr-4 w-[30%]">Admin 1 Juanda </p>
              <a href='https://wa.me/6282268875179' className=' text-blue-600 underline'><img src={whatsapp_logo} className='h-[55px] w-auto' alt="" /></a> 
            </div>
            <div className=' flex flex-row items-center w-full'>
              <p className="text-gray-600 mr-4 w-[30%]">Admin 2 Rio</p>
              <a href='https://wa.me/6281365193617' className=' text-blue-600 underline'><img src={whatsapp_logo} className='h-[55px] w-auto' alt="" /></a> 
            </div>
            <div className=' flex flex-row items-center w-full'>
              <p className="text-gray-600 mr-4 w-[30%]">Admin 3 Suryadi </p>
              <a href='https://wa.me/6281268913376' className=' text-blue-600 underline'><img src={whatsapp_logo} className='h-[55px] w-auto' alt="" /></a> 
            </div>
            <h3 className="font-semibold mt-2">Email :</h3>
            <p className="text-gray-600">Smbbgroup@gmail.com</p>

            <h3 className="font-semibold mt-2">No Telp Kantor :</h3>
            <p className="text-gray-600">(0778) 4801483</p>
          </div>
        </div>
      </div>
    </div>

    <div className="flex container mx-auto p-4 bg-gray-800 text-white">
        Ruko Papa Mama Blok B No. 25 & 26, Belian, Batam Kota, Batam City, Riau Islands 29464
    </div>
    </div>
  );
};

export default ContactUs;
