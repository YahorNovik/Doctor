// src/pages/Profile.jsx - modified with Fakturownia fields
import { useState, useEffect } from 'react';
import { profileService } from '../services/api';

export default function Profile() {
 const [formData, setFormData] = useState({
   email: '',
   name: '',
   nip: '',
   regon: '',
   city: '',
   street: '',
   buildingNumber: '',
   apiToken: '',
   domain: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [isProfileCreated, setIsProfileCreated] = useState(false);
 const [isEditing, setIsEditing] = useState(false);

 useEffect(() => {
   const checkProfile = async () => {
     try {
       setLoading(true);
       const response = await profileService.getAllProfiles();
       if (response.data && response.data.length > 0) {
         setFormData(response.data[0]);
         setIsProfileCreated(true);
       }
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   checkProfile();
 }, []);

// In Profile.jsx, update handleSubmit:
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting form data:', formData); // Debug log
      if (isProfileCreated) {
        const response = await profileService.updateProfile(formData._id, formData);
        console.log('Update response:', response.data); // Debug log
        setFormData(response.data);
        setIsEditing(false);
      } else {
        const response = await profileService.createProfile(formData);
        console.log('Create response:', response.data); // Debug log
        setFormData(response.data);
        setIsProfileCreated(true);
      }
    } catch (err) {
      console.error('Submit error:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const handleEdit = () => {
   setIsEditing(true);
 };

 const handleCancel = () => {
   setIsEditing(false);
 };

 const inputClassName = "w-full px-3 py-2 border rounded" + 
   (isProfileCreated ? " bg-gray-100" : "");

 return (
   <div className="p-8">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold">Profile</h1>
       </div>
       {isProfileCreated && !isEditing && (
         <button 
           onClick={handleEdit}
           className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
         >
           Edit Profile
         </button>
       )}
     </div>

     <div className="bg-white rounded-lg shadow-sm border p-6">
       <form onSubmit={handleSubmit} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Basic Information Section */}
           <div className="md:col-span-2">
             <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Name</label>
                 <input
                   type="text"
                   name="name"
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className={inputClassName}
                   required
                   readOnly={!isEditing && isProfileCreated}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">Email</label>
                 <input
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className={inputClassName}
                   required
                   readOnly={!isEditing && isProfileCreated}
                 />
               </div>
             </div>
           </div>

           {/* Tax Information Section */}
           <div className="md:col-span-2">
             <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">NIP</label>
                 <input
                   type="text"
                   name="nip"
                   value={formData.nip}
                   onChange={(e) => setFormData({...formData, nip: e.target.value})}
                   pattern="\d{10}"
                   className={inputClassName}
                   required
                   readOnly={isProfileCreated}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">REGON</label>
                 <input
                   type="text"
                   name="regon"
                   value={formData.regon}
                   onChange={(e) => setFormData({...formData, regon: e.target.value})}
                   pattern="\d{9}"
                   className={inputClassName}
                   required
                   readOnly={isProfileCreated}
                 />
               </div>
             </div>
           </div>

           {/* Address Section */}
           <div className="md:col-span-2">
             <h2 className="text-lg font-semibold mb-4">Address</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">City</label>
                 <input
                   type="text"
                   name="city"
                   value={formData.city}
                   onChange={(e) => setFormData({...formData, city: e.target.value})}
                   className={inputClassName}
                   required
                   readOnly={!isEditing && isProfileCreated}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">Street</label>
                 <input
                   type="text"
                   name="street"
                   value={formData.street}
                   onChange={(e) => setFormData({...formData, street: e.target.value})}
                   className={inputClassName}
                   required
                   readOnly={!isEditing && isProfileCreated}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">Building Number</label>
                 <input
                   type="text"
                   name="buildingNumber"
                   value={formData.buildingNumber}
                   onChange={(e) => setFormData({...formData, buildingNumber: e.target.value})}
                   className={inputClassName}
                   required
                   readOnly={!isEditing && isProfileCreated}
                 />
               </div>
             </div>
           </div>

           {/* Fakturownia Integration Section */}
           <div className="md:col-span-2">
             <h2 className="text-lg font-semibold mb-4">Fakturownia Integration</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">API Token</label>
                 <input
                   type="password"
                   name="apiToken"
                   value={formData.apiToken}
                   onChange={(e) => setFormData({...formData, apiToken: e.target.value})}
                   className={inputClassName}
                   readOnly={!isEditing && isProfileCreated}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">Domain</label>
                 <input
                   type="text"
                   name="domain"
                   value={formData.domain}
                   onChange={(e) => setFormData({...formData, domain: e.target.value})}
                   className={inputClassName}
                   readOnly={!isEditing && isProfileCreated}
                 />
               </div>
             </div>
           </div>
         </div>

         {(isEditing || !isProfileCreated) && (
           <div className="flex gap-4 pt-4">
             <button 
               type="submit" 
               className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
               disabled={loading}
             >
               {loading ? 'Saving...' : (isProfileCreated ? 'Save Changes' : 'Create Profile')}
             </button>
             
             {isEditing && (
               <button 
                 type="button"
                 onClick={handleCancel}
                 className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
               >
                 Cancel
               </button>
             )}
           </div>
         )}

         {error && (
           <div className="text-red-500 mt-2">{error}</div>
         )}
       </form>
     </div>
   </div>
 );
}