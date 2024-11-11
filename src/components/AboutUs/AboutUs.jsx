import React, { useEffect, useState } from 'react';
import { Navbar } from '../HomePage/HomePage'; // Adjust the import based on your folder structure
import { supabase } from '../../createClient';
import fotosmbb from '../../assets/image/fotosmbb.png'

const AboutUs = () => {
  const [partners, setPartners] = useState([]);

  // Fetch partners data from the Supabase table
  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from('partner') // Make sure this matches your table name in Supabase
      .select('partnerName, imageUrl');

    if (error) {
      console.error('Error fetching partners:', error);
    } else {
      setPartners(data);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <div className='w-full min-h-screen bg-gray-800'>
      <Navbar activeLink='aboutus' />
      <div className='container mx-auto text-white font-rethink py-4 px-3 flex'>
        {/* Left Side */}
        <div className='w-1/2 flex flex-col items-center'>
          <img
            src={fotosmbb} // Replace with your company's image URL
            alt='Company Image'
            className='w-[630px] h-[550px] rounded-md'
          />

        </div>
        {/* Right Side */}
        <div className='w-1/2 pl-10'>
          <h2 className='text-2xl font-bold uppercase'>About SMB AutoParts</h2>
          <p className='mt-6 text-justify'>
            SMB AutoParts Group, yang didirikan pada 27 Mei 2020 dan berlokasi di Ruko Papa Mama Blok B No. 25 – 26, Cikitsu Botania, Batam, Kepulauan Riau, memiliki status legal sebagai perusahaan berbadan hukum. Kami berkomitmen untuk menjadi penyedia body parts kendaraan roda empat terkemuka di Kota Batam. Didorong oleh tingginya permintaan serta pertumbuhan jumlah kendaraan roda empat di Batam, SMB AutoParts Group siap memberikan layanan terbaik dan produk berkualitas tinggi untuk memenuhi kebutuhan pelanggan kami.
          </p>
        </div>
      </div>

      {/* Partners Section */}
      <div className='container mx-auto py-6 text-white font-rethink '>
            <div className='mt-4 text-center px-[200px]'>
                <h3 className='font-bold text-[28px]'>Visi kami</h3>
                <p className='mt-2 text-[18px]'>
                Visi kami adalah menjadikan perusahaan SMB AutoParts menjadi perusahaan berkelas di tingkat nasional dengan layanan service terbaik dan bersahabat.
                </p>
                <h3 className='font-bold text-[28px] mt-4'>Misi kami</h3>
                <p className='mt-2 text-[18px]'>
                Misi kami memberikan layanan prima dan solusi yang bernilai tinggi kepada customer kami sehingga tercipta hubungan yang sangat baik dan berkesinambungan.
                </p>
            </div>

        <h2 className='text-2xl font-bold text-center text-white mb-4 mt-14'>Our Partners</h2>
        <div className='flex flex-wrap justify-center'>
          {partners.map((partner) => (
            <div key={partner.partnerName} className='bg-gray-700 m-2 p-4 rounded-lg flex flex-col items-center'>
              <img
                src={partner.imageUrl}
                alt={partner.partnerName}
                className='w-[200px] h-[123px] object-cover mb-2'
              />
              <h3 className='text-white'>{partner.partnerName}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
