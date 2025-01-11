import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { transactionService } from '../services/api';

export default function TransactionDetail() {
 const { id } = useParams();
 const location = useLocation();
 const navigate = useNavigate();
 const from = location.state?.from;
 const previousPage = location.state?.previousPage;
 const [transaction, setTransaction] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isEditing, setIsEditing] = useState(false);
 const [formData, setFormData] = useState({
   date: '',
   amount: '',
   percent: '',
   patientName: '',
   description: ''
 });

 useEffect(() => {
   const fetchTransaction = async () => {
     try {
       setLoading(true);
       const response = await transactionService.getOne(id);
       setTransaction(response.data);
       setFormData({
         date: new Date(response.data.date).toISOString().split('T')[0],
         amount: response.data.amount,
         percent: response.data.percent,
         patientName: response.data.patientName || '',
         description: response.data.description || ''
       });
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   fetchTransaction();
 }, [id]);

 const getBackLink = () => {
   if (from === 'employer') {
     return `/employers/${location.state?.employerId}`;
   }
   return '/transactions';
 };

 const getBackLinkState = () => {
   if (from === 'employer') {
     return { 
       state: { 
         from: previousPage
       }
     };
   }
   return {};
 };

 const handleDelete = async () => {
   if (window.confirm('Are you sure you want to delete this transaction?')) {
     try {
       await transactionService.delete(id);
       navigate(getBackLink(), getBackLinkState());
     } catch (err) {
       setError(err.message);
     }
   }
 };

 const handleEdit = () => setIsEditing(true);

 const handleCancel = () => {
   setIsEditing(false);
   setFormData({
     date: new Date(transaction.date).toISOString().split('T')[0],
     amount: transaction.amount,
     percent: transaction.percent,
     patientName: transaction.patientName || '',
     description: transaction.description || ''
   });
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     setLoading(true);
     const response = await transactionService.update(id, {
       ...formData,
       employerId: transaction.employerId._id
     });
     setTransaction(response.data);
     setIsEditing(false);
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

 if (loading) return <div className="p-8">Loading...</div>;
 if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
 if (!transaction) return <div className="p-8">Transaction not found</div>;

 return (
   <div className="p-8">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <Link 
           to={getBackLink()}
           {...getBackLinkState()}
           className="text-blue-500 hover:text-blue-700 mb-2 inline-block"
         >
           ← Back to {from === 'employer' ? 'Employer' : 'Transactions'}
         </Link>
         <h1 className="text-2xl font-bold">Transaction Details</h1>
       </div>
       <div className="space-x-4">
         {!isEditing && (
           <>
             <button 
               onClick={handleEdit}
               className="text-gray-600 hover:text-gray-800"
             >
               Edit
             </button>
             <button 
               onClick={handleDelete}
               className="text-red-600 hover:text-red-800"
             >
               Delete
             </button>
           </>
         )}
       </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border p-6">
       {isEditing ? (
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="grid grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium mb-1">Date</label>
               <input
                 type="date"
                 value={formData.date}
                 onChange={(e) => setFormData({...formData, date: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium mb-1">Amount (PLN)</label>
               <input
                 type="number"
                 value={formData.amount}
                 onChange={(e) => setFormData({...formData, amount: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 required
                 min="0"
                 step="0.01"
               />
             </div>

             <div>
               <label className="block text-sm font-medium mb-1">Percent</label>
               <input
                 type="number"
                 value={formData.percent}
                 onChange={(e) => setFormData({...formData, percent: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 required
                 min="0"
                 max="100"
               />
             </div>

             <div>
               <label className="block text-sm font-medium mb-1">Patient Name</label>
               <input
                 type="text"
                 value={formData.patientName}
                 onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
               />
             </div>

             <div className="col-span-2">
               <label className="block text-sm font-medium mb-1">Description</label>
               <textarea
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 rows="3"
               />
             </div>
           </div>

           <div className="flex justify-end space-x-4">
             <button
               type="button"
               onClick={handleCancel}
               className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
               disabled={loading}
             >
               {loading ? 'Saving...' : 'Save Changes'}
             </button>
           </div>
         </form>
       ) : (
         <div className="grid grid-cols-2 gap-6">
           <div>
             <h3 className="text-gray-500 text-sm font-medium">Date</h3>
             <p className="text-lg font-medium">
               {new Date(transaction.date).toLocaleDateString()}
             </p>
           </div>

           <div>
             <h3 className="text-gray-500 text-sm font-medium">Employer</h3>
             <p className="text-lg font-medium">
               {transaction.employerId?.name}
             </p>
           </div>

           <div>
             <h3 className="text-gray-500 text-sm font-medium">Amount</h3>
             <p className="text-lg font-medium">{transaction.amount} PLN</p>
           </div>

           <div>
             <h3 className="text-gray-500 text-sm font-medium">Percent</h3>
             <p className="text-lg font-medium">{transaction.percent}%</p>
           </div>

           <div>
             <h3 className="text-gray-500 text-sm font-medium">Earnings</h3>
             <p className="text-lg font-medium text-green-600">
               {(transaction.amount * transaction.percent / 100).toFixed(2)} PLN
             </p>
           </div>

           <div>
             <h3 className="text-gray-500 text-sm font-medium">Patient Name</h3>
             <p className="text-lg font-medium">
               {transaction.patientName || '-'}
             </p>
           </div>

           <div className="col-span-2">
             <h3 className="text-gray-500 text-sm font-medium">Description</h3>
             <p className="text-lg font-medium">
               {transaction.description || '-'}
             </p>
           </div>
         </div>
       )}
     </div>
   </div>
 );
}