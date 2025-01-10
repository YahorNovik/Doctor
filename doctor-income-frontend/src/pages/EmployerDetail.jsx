import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { employerService, transactionService, profileService, productService, invoiceService } from '../services/api';
import { Spinner } from '../components/Spinner';

export default function EmployerDetail() {
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const from = location.state?.from;

 // States
 const [employer, setEmployer] = useState(null);
 const [isEditing, setIsEditing] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [transactions, setTransactions] = useState([]);
 const [allTransactions, setAllTransactions] = useState([]);
 const [showTransactionForm, setShowTransactionForm] = useState(false);
 const [showInvoiceModal, setShowInvoiceModal] = useState(false);
 const [products, setProducts] = useState([]);
 const [selectedProducts, setSelectedProducts] = useState([]);
 const [invoices, setInvoices] = useState([]);
 const [transactionsLimit, setTransactionsLimit] = useState(10);
 const [invoicesLimit, setInvoicesLimit] = useState(10);
 const [showDetails, setShowDetails] = useState(false);
 const [showEmployerDetails, setShowEmployerDetails] = useState(false);
 const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
 const [stats, setStats] = useState({
   totalAmount: 0,
   totalEarnings: 0,
   transactionCount: 0
 });

 const [formData, setFormData] = useState({
   name: '',
   nip: '',
   regon: '',
   city: '',
   street: '',
   buildingNumber: '',
   defaultPercent: ''
 });

 const [transactionData, setTransactionData] = useState({
   date: new Date().toISOString().split('T')[0],
   amount: '',
   percent: '',
   employerId: id,
   patientName: '',
   description: ''
 });

 const [invoiceData, setInvoiceData] = useState({
   sellDate: new Date().toISOString().split('T')[0],
   issueDate: new Date().toISOString().split('T')[0],
   paymentTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
 });

 const resetTransactionForm = () => {
   setTransactionData({
     date: new Date().toISOString().split('T')[0],
     amount: '',
     percent: employer.defaultPercent,
     employerId: id,
     patientName: '',
     description: ''
   });
 };

 // Add resize handler
useEffect(() => {
  const handleResize = () => {
    const isDesktop = window.innerWidth >= 768;
    setShowDetails(isDesktop);
  };
 
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 useEffect(() => {
   const fetchData = async () => {
     try {
       setLoading(true);
       const [employerRes, monthlyTransactions, allTransactionsRes, productsRes, invoicesRes] = await Promise.all([
         employerService.getOne(id),
         transactionService.getAll({ 
           employerId: id,
           month: new Date().getMonth() + 1,
           year: new Date().getFullYear()
         }),
         transactionService.getAll({ employerId: id }),
         productService.getAll(),
         invoiceService.getByEmployer(id)
       ]);

       setEmployer(employerRes.data);
       setTransactions(monthlyTransactions.data);
       setAllTransactions(allTransactionsRes.data);
       setProducts(productsRes.data);
       setInvoices(invoicesRes.data);
       
       setTransactionData(prev => ({
         ...prev,
         percent: employerRes.data.defaultPercent
       }));

       setFormData({
         name: employerRes.data.name,
         nip: employerRes.data.nip,
         regon: employerRes.data.regon,
         city: employerRes.data.city,
         street: employerRes.data.street,
         buildingNumber: employerRes.data.buildingNumber,
         defaultPercent: employerRes.data.defaultPercent
       });

       const totalAmount = monthlyTransactions.data.reduce((sum, t) => sum + Number(t.amount), 0);
       const totalEarnings = monthlyTransactions.data.reduce(
         (sum, t) => sum + (Number(t.amount) * Number(t.percent) / 100), 
         0
       );

       setStats({
         totalAmount,
         totalEarnings,
         transactionCount: monthlyTransactions.data.length
       });

       if (productsRes.data.length > 0) {
         setSelectedProducts([{
           ...productsRes.data[0],
           quantity: 1,
           price: totalEarnings
         }]);
       }

     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   fetchData();
 }, [id]);

 useEffect(() => {
  const handleResize = () => {
    const isDesktop = window.innerWidth >= 768;
    setShowDetails(isDesktop);
  };
 
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 const handleDelete = async () => {
   if (window.confirm('Are you sure you want to delete this employer?')) {
     try {
       await employerService.delete(id);
       navigate(from === 'transactions' ? '/transactions' : '/employers');
     } catch (err) {
       setError(err.message);
     }
   }
 };

 const fetchTransactionsForDate = async (month, year) => {
  try {
    const monthlyTransactions = await transactionService.getAll({ 
      employerId: id,
      month: month,
      year: year
    });
    
    setTransactions(monthlyTransactions.data);
    
    const totalAmount = monthlyTransactions.data.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalEarnings = monthlyTransactions.data.reduce(
      (sum, t) => sum + (Number(t.amount) * Number(t.percent) / 100), 
      0
    );

    setStats({
      totalAmount,
      totalEarnings,
      transactionCount: monthlyTransactions.data.length
    });

    if (products.length > 0) {
      setSelectedProducts([{
        ...products[0],
        quantity: 1,
        price: totalEarnings
      }]);
    }
  } catch (err) {
    setError(err.message);
  }
};

useEffect(() => {
  if (!isEditing) {
    fetchTransactionsForDate(selectedMonth, selectedYear);
  }
}, [selectedMonth, selectedYear, isEditing]);

 const handleTransactionClick = (transactionId) => {
   navigate(`/transactions/${transactionId}`, { 
     state: { 
       from: 'employer',
       employerId: id,
       previousPage: from
     } 
   });
 };

 const handleCancel = () => {
  setIsEditing(false);
  setFormData({
    name: employer.name,
    nip: employer.nip,
    regon: employer.regon,
    city: employer.city,
    street: employer.street,
    buildingNumber: employer.buildingNumber,
    defaultPercent: employer.defaultPercent
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    const updatedEmployer = await employerService.update(id, formData);
    setEmployer(updatedEmployer.data);
    setIsEditing(false);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
 const handleTransactionSubmit = async (e) => {
   e.preventDefault();
   try {
     setLoading(true);
     await transactionService.create(transactionData);
     await refreshData();
     setShowTransactionForm(false);
     resetTransactionForm();
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

 const createInvoice = async (e) => {
   e.preventDefault();
   try {
     setLoading(true);
     const profileResponse = await profileService.getAllProfiles();
     const profile = profileResponse.data[0];

     const response = await fetch(
       `https://${profile.domain}.fakturownia.pl/invoices.json`,
       {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           api_token: profile.apiToken,
           invoice: {
             kind: 'vat',
             number: null,
             sell_date: invoiceData.sellDate,
             issue_date: invoiceData.issueDate,
             payment_to: invoiceData.paymentTo,
             seller_name: profile.name,
             seller_tax_no: employer.nip,
             client_id: employer.fakturownia_id,
             positions: selectedProducts.map(product => ({
               name: product.name,
               tax: 'zw',
               total_price_gross: product.price || 0,
               quantity: product.quantity || 1
             }))
           }
         })
       }
     );

     if (response.ok) {
       const data = await response.json();
       await invoiceService.create({
         fakturownia_id: data.id,
         number: data.number,
         sellDate: data.sell_date,
         price: parseFloat(data.price_gross),
         employerId: id
       });
       setShowInvoiceModal(false);
       setSelectedProducts([]);
       await refreshData();
     } else {
       throw new Error('Failed to create invoice');
     }
   } catch (err) {
     setError('Failed to create invoice: ' + err.message);
   } finally {
     setLoading(false);
   }
 };

 const refreshData = async () => {
   try {
     const [monthlyTransactions, allTransactionsRes, invoicesRes] = await Promise.all([
       transactionService.getAll({ 
         employerId: id,
         month: new Date().getMonth() + 1,
         year: new Date().getFullYear()
       }),
       transactionService.getAll({ employerId: id }),
       invoiceService.getByEmployer(id)
     ]);
     
     setTransactions(monthlyTransactions.data);
     setAllTransactions(allTransactionsRes.data);
     setInvoices(invoicesRes.data);
     
     const totalAmount = monthlyTransactions.data.reduce((sum, t) => sum + Number(t.amount), 0);
     const totalEarnings = monthlyTransactions.data.reduce(
       (sum, t) => sum + (Number(t.amount) * Number(t.percent) / 100), 
       0
     );

     setStats({
       totalAmount,
       totalEarnings,
       transactionCount: monthlyTransactions.data.length
     });
   } catch (err) {
     setError(err.message);
   }
 };

 if (loading && !employer) return <div className="p-8">Loading...</div>;
 if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
 if (!employer) return <div className="p-8">Employer not found</div>;

 return (
   <div className="p-8">
     {/* Header */}
     <div className="flex justify-between items-center mb-6">
   <Link 
     to={from === 'transactions' ? '/transactions' : '/employers'}
     className="text-blue-500 hover:text-blue-700"
   >
     ← Back to {from === 'transactions' ? 'Transactions' : 'Employers'}
   </Link>
   
   {!isEditing && (
     <div className="flex gap-2">
       <button 
         onClick={() => setIsEditing(true)}
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
     </div>
   )}
 </div>

 <h1 className="text-2xl font-bold mb-8 cursor-pointer"
        onClick={() => !isEditing && setShowEmployerDetails(!showEmployerDetails)}
      >
        {employer.name}
        <button className="text-gray-400 ml-2 inline-block">
          {showEmployerDetails ? '▼' : '▶'}
        </button>
</h1>

      {(showEmployerDetails || isEditing) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-medium mb-4">Employer Details</h3>
          <div className="border-t pt-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border rounded"
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Default Percent</label>
                    <input
                      type="number"
                      value={formData.defaultPercent}
                      onChange={(e) => setFormData({...formData, defaultPercent: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-4">
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
                  <span className="text-sm text-gray-500 block mb-2">NIP</span>
                  <span className="text-lg">{employer.nip}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">REGON</span>
                  <span className="text-lg">{employer.regon}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Address</span>
                  <span className="text-lg">
                    {employer.street} {employer.buildingNumber}, {employer.city}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Default Percent</span>
                  <span className="text-lg">{employer.defaultPercent}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

{ !isEditing && (
  <>
<h2 className="text-xl font-semibold mb-4">
    Monthly Overview ({new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear})
</h2>
<div className="mb-6 flex gap-4">
 <div>
   <select
     value={selectedMonth}
     onChange={(e) => setSelectedMonth(e.target.value)}
     className="px-3 py-2 border rounded"
   >
     {[...Array(12)].map((_, i) => (
       <option key={i + 1} value={i + 1}>
         {new Date(2000, i).toLocaleString('default', { month: 'long' })}
       </option>
     ))}
   </select>
 </div>

 <div>
   <select
     value={selectedYear}
     onChange={(e) => setSelectedYear(e.target.value)}
     className="px-3 py-2 border rounded"
   >
     {[...Array(5)].map((_, i) => {
       const year = new Date().getFullYear() - 2 + i;
       return (
         <option key={year} value={year}>
           {year}
         </option>
       );
     })}
   </select>
 </div>
</div>
</>
)}

     {!isEditing && (
        <>
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
            <p className="text-2xl font-bold text-green-600">{stats.totalEarnings.toFixed(2)} PLN</p>
          </div>
          <button className="text-gray-400">
            {showDetails ? '▼' : '▶'}
          </button>
        </div>

        {showDetails && (
          <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500 block mb-2">Total Amount</span>
              <span className="text-lg">{stats.totalAmount.toFixed(2)} PLN</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-2">Transactions</span>
              <span className="text-lg">{stats.transactionCount}</span>
            </div>
          </div>
        )}
      </div>
      </>
    )}

{ !isEditing && (
<>
{/* Invoices Section */}
<h2 className="text-xl font-semibold mb-4">Invoices</h2>
<div className="bg-white rounded-lg shadow-sm border mb-8">

  {/* Desktop view */}
  <div className="hidden md:block">
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Invoice Number</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sell Date</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price</th>
        </tr>
      </thead>
      <tbody>
        {invoices.length > 0 ? (
          invoices.slice(0, invoicesLimit).map(invoice => (
            <tr key={invoice._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{invoice.number}</td>
              <td className="px-6 py-4">{new Date(invoice.sellDate).toLocaleDateString()}</td>
              <td className="px-6 py-4">{invoice.price.toFixed(2)} PLN</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
              No invoices available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Mobile view */}
  <div className="md:hidden divide-y">
    {invoices.length > 0 ? (
      invoices.slice(0, invoicesLimit).map(invoice => (
        <div key={invoice._id} className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">{invoice.number}</span>
            <span className="text-green-600 font-bold">{invoice.price.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="text-gray-500">
              Sell Date: {new Date(invoice.sellDate).toLocaleDateString('en-GB').replace(/\//g, '.')}
            </div>
            <div>{invoice.employerId?.name}</div>
          </div>
        </div>
      ))
    ) : (
      <div className="p-4 text-center text-gray-500">
        No invoices available.
      </div>
    )}
  </div>

  {invoices.length > 10 && invoices.length > invoicesLimit && (
    <div className="px-6 py-3 text-center">
      <button
        onClick={() => setInvoicesLimit(prev => prev + 10)}
        className="text-blue-500 hover:text-blue-700"
      >
        Show More
      </button>
    </div>
  )}
</div>
</> )}

{ !isEditing && (
<>
{/* Transactions Section */}
<h2 className="text-xl font-semibold mb-4">Transactions</h2>
<div className="bg-white rounded-lg shadow-sm border mb-8">
 {/* Desktop view */}
 <div className="hidden md:block">
   <table className="min-w-full">
     <thead>
       <tr className="bg-gray-50">
         <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
         <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
         <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">%</th>
         <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Earnings</th>
       </tr>
     </thead>
     <tbody>
       {allTransactions.length > 0 ? (
         allTransactions.slice(0, transactionsLimit).map(transaction => (
           <tr 
             key={transaction._id}
             onClick={() => handleTransactionClick(transaction._id)}
             className="hover:bg-gray-50 cursor-pointer"
           >
             <td className="px-6 py-4">{new Date(transaction.date).toLocaleDateString()}</td>
             <td className="px-6 py-4">{transaction.amount} PLN</td>
             <td className="px-6 py-4">{transaction.percent}%</td>
             <td className="px-6 py-4 text-green-600">
               {(transaction.amount * transaction.percent / 100).toFixed(2)} PLN
             </td>
           </tr>
         ))
       ) : (
         <tr>
           <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
             No transactions available.
           </td>
         </tr>
       )}
     </tbody>
   </table>
 </div>

 {/* Mobile view */}
 <div className="md:hidden divide-y">
   {allTransactions.length > 0 ? (
     allTransactions.slice(0, transactionsLimit).map(transaction => (
       <div 
         key={transaction._id}
         onClick={() => handleTransactionClick(transaction._id)}
         className="p-4 space-y-2"
       >
         <div className="flex justify-between items-center">
           <span className="font-medium">
             {new Date(transaction.date).toLocaleDateString()}
           </span>
           <span className="text-green-600 font-bold">
             {(transaction.amount * transaction.percent / 100).toFixed(2)} PLN
           </span>
         </div>
         <div className="flex justify-between text-sm">
           <div className="text-gray-500">
             Amount: {transaction.amount} PLN
           </div>
           <div className="text-gray-500">
             %: {transaction.percent}
           </div>
         </div>
         {(transaction.patientName || transaction.description) && (
           <div className="text-sm space-y-1 pt-2 border-t">
             {transaction.patientName && (
               <div>
                 <span className="text-gray-500">Patient:</span> {transaction.patientName}
               </div>
             )}
             {transaction.description && (
               <div>
                 <span className="text-gray-500">Description:</span> {transaction.description}
               </div>
             )}
           </div>
         )}
       </div>
     ))
   ) : (
     <div className="p-4 text-center text-gray-500">
       No transactions available.
     </div>
   )}
 </div>

 {allTransactions.length > 10 && allTransactions.length > transactionsLimit && (
   <div className="px-6 py-3 text-center">
     <button
       onClick={() => setTransactionsLimit(prev => prev + 10)}
       className="text-blue-500 hover:text-blue-700"
     >
       Show More
     </button>
   </div>
 )}
</div>
</>)}


{/* Floating Action Buttons */}
{!showInvoiceModal && !showTransactionForm && !isEditing && (
<div className="fixed bottom-4 right-4 flex flex-col gap-2">
{employer.fakturownia_id && (
<button
  onClick={() => {
    setShowInvoiceModal(true);
    if (products.length > 0) {
      setSelectedProducts([{
        ...products[0],
        quantity: 1,
        price: stats.totalEarnings
      }]);
    }
  }}
  className="bg-black bg-opacity-35 text-white px-6 py-3 rounded hover:bg-opacity-90 shadow-lg"
>
  + Invoice
</button>
)}
<button 
onClick={() => setShowTransactionForm(!showTransactionForm)}
className="bg-black bg-opacity-35 text-white px-6 py-3 rounded hover:bg-opacity-90 shadow-lg"
>
+ Transaction
</button>
</div>
)}
{/* Transaction Form Modal */}
{showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-20">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Transaction</h2>
                <button
                  onClick={() => {
                    setShowTransactionForm(false);
                    resetTransactionForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={transactionData.date}
                    onChange={(e) => setTransactionData({...transactionData, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount (PLN)</label>
                  <input
                    type="number"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
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
                    value={transactionData.percent}
                    onChange={(e) => setTransactionData({...transactionData, percent: e.target.value})}
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
                    value={transactionData.patientName}
                    onChange={(e) => setTransactionData({...transactionData, patientName: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={transactionData.description}
                    onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    rows="2"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransactionForm(false);
                      resetTransactionForm();
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Spinner size="small" />
                        <span className="ml-2">Adding...</span>
                      </span>
                    ) : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Invoice Modal */}
     {showInvoiceModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-20">
         <div className="bg-white rounded-lg w-full max-w-2xl">
           <div className="p-4">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Create Invoice</h2>
               <button
                 onClick={() => {
                   setShowInvoiceModal(false);
                   setSelectedProducts([]);
                   setInvoiceData({
                     sellDate: new Date().toISOString().split('T')[0],
                     issueDate: new Date().toISOString().split('T')[0],
                     paymentTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                   });
                 }}
                 className="text-gray-500 hover:text-gray-700 text-xl font-bold"
               >
                 ×
               </button>
             </div>

             <form onSubmit={createInvoice} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <div>
                   <label className="block text-sm font-medium mb-1">Sell Date</label>
                   <input
                     type="date"
                     value={invoiceData.sellDate}
                     onChange={(e) => setInvoiceData({...invoiceData, sellDate: e.target.value})}
                     className="w-full px-3 py-2 border rounded"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Issue Date</label>
                   <input
                     type="date"
                     value={invoiceData.issueDate}
                     onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
                     className="w-full px-3 py-2 border rounded"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Payment To</label>
                   <input
                     type="date"
                     value={invoiceData.paymentTo}
                     onChange={(e) => setInvoiceData({...invoiceData, paymentTo: e.target.value})}
                     className="w-full px-3 py-2 border rounded"
                     required
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium mb-2">Products</label>
                 <div className="max-h-[40vh] overflow-y-auto border rounded">
                   {products.map(product => (
                     <div key={product._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                       <div className="flex items-center space-x-3">
                         <input
                           type="checkbox"
                           checked={selectedProducts.some(p => p._id === product._id)}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setSelectedProducts([...selectedProducts, {...product, quantity: 1, price: 0}]);
                             } else {
                               setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
                             }
                           }}
                         />
                         <span>{product.name}</span>
                       </div>
                       {selectedProducts.some(p => p._id === product._id) && (
                         <div className="flex items-center space-x-2">
                           <input
                             type="number"
                             min="1"
                             value={selectedProducts.find(p => p._id === product._id)?.quantity || 1}
                             onChange={(e) => {
                               setSelectedProducts(selectedProducts.map(p => 
                                 p._id === product._id ? {...p, quantity: Number(e.target.value)} : p
                               ));
                             }}
                             className="w-20 px-2 py-1 border rounded"
                             placeholder="Qty"
                           />
                           <input
                             type="number"
                             min="0"
                             step="0.01"
                             value={selectedProducts.find(p => p._id === product._id)?.price || 0}
                             onChange={(e) => {
                               setSelectedProducts(selectedProducts.map(p => 
                                 p._id === product._id ? {...p, price: Number(e.target.value)} : p
                               ));
                             }}
                             className="w-24 px-2 py-1 border rounded"
                             placeholder="Price"
                           />
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>

               <div className="flex justify-end space-x-3 pt-2">
                 <button
                   type="button"
                   onClick={() => {
                     setShowInvoiceModal(false);
                     setSelectedProducts([]);
                     setInvoiceData({
                       sellDate: new Date().toISOString().split('T')[0],
                       issueDate: new Date().toISOString().split('T')[0],
                       paymentTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                     });
                   }}
                   className="px-4 py-2 text-gray-600 hover:text-gray-800"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={loading || selectedProducts.length === 0}
                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                 >
                   {loading ? (
                     <span className="flex items-center justify-center">
                       <Spinner size="small" />
                       <span className="ml-2">Creating...</span>
                     </span>
                   ) : 'Create Invoice'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       </div>
     )}

     {error && <div className="text-red-500 mb-4">{error}</div>}
   </div>
 );
}