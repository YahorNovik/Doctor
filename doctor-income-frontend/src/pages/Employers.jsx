// src/pages/Employers.jsx
import { useState, useEffect } from 'react';
import { employerService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Employers() {
 console.log('Employers component rendering');
 const [employers, setEmployers] = useState([]);
 const [formData, setFormData] = useState({
   name: '',
   nip: '',
   regon: '',
   city: '',
   street: '',
   buildingNumber: '',
   defaultPercent: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [showCreateForm, setShowCreateForm] = useState(false);
 const navigate = useNavigate();

useEffect(() => {
    const fetchEmployers = async () => {
      try {
        console.log('Fetching employers...');
        console.log('Current token:', localStorage.getItem('token'));
        const response = await employerService.getAll();
        console.log('Employers response:', response);
        setEmployers(response.data);
      } catch (err) {
        console.error('Error fetching employers:', err);
        setError(err.message);
      }
    };
  
    fetchEmployers();
  }, []);

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     setLoading(true);
     await employerService.create(formData);
     setShowCreateForm(false);
     resetForm();
     const response = await employerService.getAll();
     setEmployers(response.data);
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

 const resetForm = () => {
   setFormData({
     name: '',
     nip: '',
     regon: '',
     city: '',
     street: '',
     buildingNumber: '',
     defaultPercent: ''
   });
 };

 const handleRowClick = (employerId) => {
   navigate(`/employers/${employerId}`);
 };

 return (
   <div className="p-8">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Employers</h1>
       <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {showCreateForm ? 'Cancel' : 'Add Employer'}
        </button>
     </div>

     {error && <div className="text-red-500 mb-4">{error}</div>}
     
     {showCreateForm && (
       <form onSubmit={handleSubmit} className="max-w-md mb-8 space-y-4">
         <div>
           <label className="block text-sm font-medium mb-1">Name</label>
           <input
             type="text"
             value={formData.name}
             onChange={(e) => setFormData({...formData, name: e.target.value})}
             className="w-full px-3 py-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">NIP</label>
           <input
             type="text"
             value={formData.nip}
             onChange={(e) => setFormData({...formData, nip: e.target.value})}
             pattern="\d{10}"
             className="w-full px-3 py-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">REGON</label>
           <input
             type="text"
             value={formData.regon}
             onChange={(e) => setFormData({...formData, regon: e.target.value})}
             pattern="\d{9}"
             className="w-full px-3 py-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">City</label>
           <input
             type="text"
             value={formData.city}
             onChange={(e) => setFormData({...formData, city: e.target.value})}
             className="w-full px-3 py-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Street</label>
           <input
             type="text"
             value={formData.street}
             onChange={(e) => setFormData({...formData, street: e.target.value})}
             className="w-full px-3 py-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Building Number</label>
           <input
             type="text"
             value={formData.buildingNumber}
             onChange={(e) => setFormData({...formData, buildingNumber: e.target.value})}
             className="w-full px-3 py-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Default Percent</label>
           <input
             type="number"
             value={formData.defaultPercent}
             onChange={(e) => setFormData({...formData, defaultPercent: e.target.value})}
             min="0"
             max="100"
             className="w-full px-3 py-2 border rounded"
             required
           />
         </div>

         <button 
           type="submit" 
           className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
           disabled={loading}
         >
           {loading ? 'Creating...' : 'Create Employer'}
         </button>
       </form>
     )}

{!showCreateForm && (
        <>
          {/* Desktop View Table */}
<div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">NIP</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">City</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Default %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employers.map(employer => (
              <tr 
                key={employer._id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(employer._id)}
              >
                <td className="px-6 py-4">{employer.name}</td>
                <td className="px-6 py-4">{employer.nip}</td>
                <td className="px-6 py-4">{employer.city}</td>
                <td className="px-6 py-4">{employer.defaultPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {employers.map(employer => (
          <div 
            key={employer._id} 
            onClick={() => handleRowClick(employer._id)}
            className="bg-white rounded-lg shadow-sm border p-4 space-y-3 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div className="font-medium text-lg">{employer.name}</div>
              <div className="text-gray-500 text-sm">{employer.nip}</div>
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">City:</span> {employer.city}
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">Default %:</span> {employer.defaultPercent}%
            </div>
          </div>
        ))}
      </div>
      </>
      )}
   </div>
 );
}