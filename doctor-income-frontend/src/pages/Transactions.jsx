import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService, profileService, productService, employerService, invoiceService } from '../services/api';
import { useOutletContext } from 'react-router-dom';
import { Spinner } from '../components/Spinner';

export default function Transactions() {
 const [transactions, setTransactions] = useState([]);
 const [allTransactions, setAllTransactions] = useState([]);
 const [employers, setEmployers] = useState([]);
 const [invoices, setInvoices] = useState([]);
 const [selectedEmployer, setSelectedEmployer] = useState('');
 const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
 const [showCreateForm, setShowCreateForm] = useState(false);
 const [showInvoiceModal, setShowInvoiceModal] = useState(false);
 const [selectedEmployerForInvoiceState, setSelectedEmployerForInvoiceState] = useState(null);
 const [invoicesLimit, setInvoicesLimit] = useState(10);
 const [transactionsLimit, setTransactionsLimit] = useState(10);
 const [showDetails, setShowDetails] = useState(window.innerWidth >= 768);
 const { isSidebarOpen } = useOutletContext();
 const setSelectedEmployerForInvoice = (employer) => {
  if (!employer) return;
  const employerStats = stats.byEmployer.find(stat => stat.employerId === employer._id);
  const defaultPrice = employerStats?.earnings || 0;
  setSelectedProducts([]);
  setSelectedEmployerForInvoiceState(employer);
  if (products.length > 0) {
    setSelectedProducts([{
      ...products[0],
      quantity: 1,
      price: defaultPrice
    }]);
  }
};
 const [products, setProducts] = useState([]);
 const [selectedProducts, setSelectedProducts] = useState([]);
 const [stats, setStats] = useState({
   totalAmount: 0,
   totalEarnings: 0,
   transactionCount: 0,
   byEmployer: []
 });
 const [invoiceData, setInvoiceData] = useState({
    sellDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    paymentTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
   });
   const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    percent: '',
    employerId: '',
    patientName: '', 
    description: ''  
  });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const navigate = useNavigate();

 useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [employersRes, productsRes, invoicesRes, allTransactionsRes] = await Promise.all([
          employerService.getAll(),
          productService.getAll(),
          invoiceService.getAll(),
          transactionService.getAll({})
        ]);
        setEmployers(employersRes.data);
        setProducts(productsRes.data);
        setInvoices(invoicesRes.data);
        setAllTransactions(allTransactionsRes.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchInitialData();
  }, []);

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
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = {
          month: selectedMonth,
          year: selectedYear,
          employerId: selectedEmployer
        };
        const response = await transactionService.getAll(params);
        setTransactions(response.data);
 
        // Calculate totals for the month
        const totalAmount = response.data.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalEarnings = response.data.reduce(
          (sum, t) => sum + (Number(t.amount) * Number(t.percent) / 100), 
          0
        );
 
        // Group by employer for the month
        const employerStats = {};
        employers.forEach(employer => {
          employerStats[employer._id] = {
            employerId: employer._id,
            employerName: employer.name,
            earnings: 0,
            amount: 0,
            transactionCount: 0
          };
        });
 
        response.data.forEach(transaction => {
          const employerId = transaction.employerId._id;
          if (employerStats[employerId]) {
            employerStats[employerId].earnings += (Number(transaction.amount) * Number(transaction.percent)) / 100;
            employerStats[employerId].amount += Number(transaction.amount);
            employerStats[employerId].transactionCount += 1;
          }
        });
 
        setStats({
          totalAmount,
          totalEarnings,
          transactionCount: response.data.length,
          byEmployer: Object.values(employerStats)
        });
 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [selectedEmployer, selectedMonth, selectedYear, employers]);

 const handleCreateInvoice = async (e) => {
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
             seller_tax_no: selectedEmployerForInvoiceState.nip,
             client_id: selectedEmployerForInvoiceState.fakturownia_id,
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
       setShowInvoiceModal(false);
       setSelectedProducts([]);
       setSelectedEmployerForInvoiceState(null);
       const invoiceData = await response.json();
       await invoiceService.create({
         fakturownia_id: invoiceData.id,
         number: invoiceData.number,
         sellDate: invoiceData.sell_date,
         price: parseFloat(invoiceData.price_gross),
         employerId: selectedEmployerForInvoiceState._id
       });
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

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     setLoading(true);
     await transactionService.create(formData);
     await refreshData();
     setShowCreateForm(false);
     
     const params = {
       month: selectedMonth,
       year: selectedYear,
       employerId: selectedEmployer
     };
     const response = await transactionService.getAll(params);
     setTransactions(response.data);
     setFormData({
       date: new Date().toISOString().split('T')[0],
       amount: '',
       percent: '',
       employerId: ''
     });
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

 const handleTransactionClick = (transactionId) => {
   navigate(`/transactions/${transactionId}`);
 };

 const refreshData = async () => {
    try {
      const [monthlyTransactions, allTransactions, invoicesRes] = await Promise.all([
        transactionService.getAll({ month: selectedMonth, year: selectedYear }),
        transactionService.getAll({}),
        invoiceService.getAll()
      ]);
      
      setTransactions(monthlyTransactions.data);
      setAllTransactions(allTransactions.data);
      setInvoices(invoicesRes.data);
      
      // Update monthly stats
      const totalAmount = monthlyTransactions.data.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalEarnings = monthlyTransactions.data.reduce(
        (sum, t) => sum + (Number(t.amount) * Number(t.percent) / 100), 
        0
      );
      
      const employerStats = {};
      employers.forEach(employer => {
        employerStats[employer._id] = {
          employerId: employer._id,
          employerName: employer.name,
          earnings: 0,
          amount: 0,
          transactionCount: 0
        };
      });
  
      monthlyTransactions.data.forEach(transaction => {
        const employerId = transaction.employerId._id;
        if (employerStats[employerId]) {
          employerStats[employerId].earnings += (Number(transaction.amount) * Number(transaction.percent)) / 100;
          employerStats[employerId].amount += Number(transaction.amount);
          employerStats[employerId].transactionCount += 1;
        }
      });
  
      setStats({
        totalAmount,
        totalEarnings, 
        transactionCount: monthlyTransactions.data.length,
        byEmployer: Object.values(employerStats)
      });
    } catch (err) {
      setError(err.message);
    }
  };

 return (
   <div className="p-4">
   <div className="flex justify-between items-center mb-4">
  <h1 className="text-lg font-bold pl-8 md:pl-0">Transactions</h1>
  <div className="hidden md:flex gap-2">
    <button
      onClick={() => setShowInvoiceModal(true)}
      className="bg-green-500 text-white py-1.5 px-3 rounded hover:bg-green-600 text-sm"
    >
      Create Invoice
    </button>
    <button 
      onClick={() => setShowCreateForm(!showCreateForm)}
      className="bg-blue-500 text-white py-1.5 px-3 rounded hover:bg-blue-600 text-sm"
    >
      {showCreateForm ? 'Cancel' : 'Add Transaction'}
    </button>
  </div>
</div>

<h2 className="text-base font-semibold mb-2">
  Monthly Overview ({new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear})
</h2>

<div className="mb-4 flex gap-2">
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="w-32 px-2 py-1.5 border rounded bg-white text-sm"
  >
    {[...Array(12)].map((_, i) => (
      <option key={i + 1} value={i + 1}>
        {new Date(2000, i).toLocaleString('default', { month: 'long' })}
      </option>
    ))}
  </select>

  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    className="w-24 px-2 py-1.5 border rounded bg-white text-sm"
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

{/* Monthly Overview */}
<div className="mb-4">
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <div 
      className="flex justify-between items-center cursor-pointer"
      onClick={() => setShowDetails(prev => !prev)}
    >
      <div>
        <h3 className="text-gray-500 text-xs font-medium">Total Earnings</h3>
        <p className="text-xl font-bold text-green-600">{stats.totalEarnings.toFixed(2)} PLN</p>
      </div>
      <button className="text-gray-400">
        {showDetails ? '▼' : '▶'}
      </button>
    </div>

    {showDetails && (
      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-gray-500 block mb-1">Total Amount</span>
          <span className="text-base">{stats.totalAmount.toFixed(2)} PLN</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">Transactions</span>
          <span className="text-base">{stats.transactionCount}</span>
        </div>
      </div>
    )}
  </div>
</div>

<div className="mb-4">
  <h2 className="text-base font-semibold mb-2">
    By Employer ({new Date(selectedYear, selectedMonth-1).toLocaleString('default', { month: 'long' })} {selectedYear})
  </h2>
  
  {/* Desktop view */}
  <div className="hidden md:block">
    <div className="bg-white rounded-lg shadow-sm border">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-2 text-left text-sm font-medium text-gray-500">Employer</th>
            <th className="px-6 py-2 text-left text-sm font-medium text-gray-500">Earnings</th>
            <th className="px-6 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
            <th className="px-6 py-2 text-left text-sm font-medium text-gray-500">Transactions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stats.byEmployer.map((stat) => (
            <tr 
              key={stat.employerId}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/employers/${stat.employerId}`, { state: { from: 'transactions' } })}
            >
              <td className="px-6 py-3">{stat.employerName}</td>
              <td className="px-6 py-3 text-green-600">{stat.earnings.toFixed(2)} PLN</td>
              <td className="px-6 py-3">{stat.amount.toFixed(2)} PLN</td>
              <td className="px-6 py-3">{stat.transactionCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Mobile view */}
  <div className="md:hidden space-y-2">
    {stats.byEmployer.map((stat) => (
      <div 
        key={stat.employerId}
        onClick={() => navigate(`/employers/${stat.employerId}`, { state: { from: 'transactions' } })}
        className="bg-white rounded-lg shadow-sm border p-3 space-y-2 cursor-pointer"
      >
        <div className="font-medium">{stat.employerName}</div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">Earnings</div>
            <div className="text-green-600 font-bold">{stat.earnings.toFixed(2)} PLN</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Amount</div>
            <div className="font-medium">{stat.amount.toFixed(2)} PLN</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {stat.transactionCount} transaction{stat.transactionCount !== 1 ? 's' : ''}
        </div>
      </div>
    ))}
  </div>
</div>

{showCreateForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto">
   <div className="min-h-screen flex items-center justify-center p-4">
    <div className="bg-white rounded-lg w-full max-w-md">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <button
            onClick={() => {
              setShowCreateForm(false);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                amount: '',
                percent: '',
                employerId: ''
              });
            }}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">Employer</label>
            <select
              value={formData.employerId}
              onChange={(e) => {
                const employer = employers.find(emp => emp._id === e.target.value);
                setFormData({
                  ...formData,
                  employerId: e.target.value,
                  percent: employer?.defaultPercent || ''
                });
              }}
              className="w-full px-3 py-2 border rounded bg-white"
              required
            >
              <option value="">Select Employer</option>
              {employers.map(employer => (
                <option key={employer._id} value={employer._id}>
                  {employer.name}
                </option>
              ))}
            </select>
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

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              rows="2"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  percent: '',
                  employerId: ''
                });
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
  </div>
)}

     {/* Invoice Modal */}
     {showInvoiceModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="bg-white rounded-lg w-full relative">
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Create Invoice</h2>
            <button
              onClick={() => {
                setShowInvoiceModal(false);
                setSelectedEmployerForInvoiceState(null);
                setSelectedProducts([]);
                setInvoiceData({
                  sellDate: new Date().toISOString().split('T')[0],
                  issueDate: new Date().toISOString().split('T')[0],
                  paymentTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                });
              }}
              className="text-2xl text-gray-500"
            >
              ×
            </button>
          </div>

          {/* Date inputs */}
{/* Date inputs row */}
<div className="grid grid-cols-3 gap-2">
  <div>
    <label className="text-sm mb-1 block">Sell Date</label>
    <input
      type="date"
      value={invoiceData.sellDate}
      onChange={(e) => setInvoiceData({...invoiceData, sellDate: e.target.value})}
      className="w-full px-2 py-1.5 bg-gray-100 rounded text-sm"
      required
    />
  </div>
  <div>
    <label className="text-sm mb-1 block">Issue Date</label>
    <input
      type="date"
      value={invoiceData.issueDate}
      onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
      className="w-full px-2 py-1.5 bg-gray-100 rounded text-sm"
      required
    />
  </div>
  <div>
    <label className="text-sm mb-1 block">Payment To</label>
    <input
      type="date"
      value={invoiceData.paymentTo}
      onChange={(e) => setInvoiceData({...invoiceData, paymentTo: e.target.value})}
      className="w-full px-2 py-1.5 bg-gray-100 rounded text-sm"
      required
    />
  </div>
</div>

          {/* Products section */}
          <div className="mt-4">
            <label className="text-base mb-1 block">Products</label>
            <div className="border rounded-lg">
              {products.map(product => (
                <div key={product._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
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
                    <span className="text-sm">{product.name}</span>
                  </div>
                  {selectedProducts.some(p => p._id === product._id) && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={selectedProducts.find(p => p._id === product._id)?.quantity || 1}
                        onChange={(e) => {
                          setSelectedProducts(selectedProducts.map(p => 
                            p._id === product._id ? {...p, quantity: Number(e.target.value)} : p
                          ));
                        }}
                        className="w-16 px-2 py-1 bg-gray-100 rounded text-right"
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
                        className="w-24 px-2 py-1 bg-gray-100 rounded text-right"
                        placeholder="Price"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="flex-1 py-3 text-gray-600 bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInvoice}
              disabled={selectedProducts.length === 0}
              className="flex-1 py-3 text-white bg-blue-500 rounded disabled:bg-gray-300"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
         
         {error && <div className="text-red-500 mb-4">{error}</div>}

         <h2 className="text-base font-semibold mb-2">Invoices</h2>
<div className="mb-4">
  {/* Desktop view */}
  <div className="hidden md:block">
    <div className="bg-white rounded-lg shadow-sm border">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Invoice Number</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sell Date</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Employer</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.slice(0, invoicesLimit).map(invoice => (
              <tr key={invoice._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{invoice.number}</td>
                <td className="px-4 py-2">{new Date(invoice.sellDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{invoice.price.toFixed(2)} PLN</td>
                <td className="px-4 py-2">{invoice.employerId?.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                No invoices available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Mobile view */}
  <div className="md:hidden space-y-2">
    {invoices.length > 0 ? (
      invoices.slice(0, invoicesLimit).map(invoice => (
        <div key={invoice._id} className="bg-white rounded-lg shadow-sm border p-3 space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-medium text-sm">{invoice.number}</div>
            <div className="text-green-600 font-bold">{invoice.price.toFixed(2)} PLN</div>
          </div>
          <div className="flex justify-between text-xs">
            <div className="text-gray-500">
              {new Date(invoice.sellDate).toLocaleDateString('en-GB').replace(/\//g, '.')}
            </div>
            <div>{invoice.employerId?.name}</div>
          </div>
        </div>
      ))
    ) : (
      <div className="bg-white rounded-lg shadow-sm border p-3 text-center text-gray-500 text-sm">
        No invoices available.
      </div>
    )}
  </div>

  {invoices.length > 10 && invoices.length > invoicesLimit && (
    <div className="text-center mt-2">
      <button
        onClick={() => setInvoicesLimit(prev => prev + 10)}
        className="text-blue-500 hover:text-blue-700 text-sm"
      >
        Show More
      </button>
    </div>
  )}
</div>
         
<h2 className="text-base font-semibold mb-2">Transactions List</h2>
<div className="bg-white rounded-lg shadow-sm border mb-4">
  {/* Desktop view */}
  <div className="hidden md:block">
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Employer</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">%</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Earnings</th>
        </tr>
      </thead>
      <tbody>
        {allTransactions.length > 0 ? (
          allTransactions.slice(0, transactionsLimit).map(transaction => (
            <tr 
              key={transaction._id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleTransactionClick(transaction._id)}
            >
              <td className="px-4 py-2 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-sm">{transaction.employerId?.name}</td>
              <td className="px-4 py-2 text-sm">{transaction.amount} PLN</td>
              <td className="px-4 py-2 text-sm">{transaction.percent}%</td>
              <td className="px-4 py-2 text-sm text-green-600">
                {(transaction.amount * transaction.percent / 100).toFixed(2)} PLN
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="px-4 py-2 text-center text-gray-500 text-sm">
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
          className="p-3 space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm">
              {new Date(transaction.date).toLocaleDateString()}
            </span>
            <span className="text-green-600 font-bold">
              {(transaction.amount * transaction.percent / 100).toFixed(2)} PLN
            </span>
          </div>
          <div className="text-sm">{transaction.employerId?.name}</div>
          <div className="flex justify-between text-xs">
            <div className="text-gray-500">
              Amount: {transaction.amount} PLN
            </div>
            <div className="text-gray-500">
              %: {transaction.percent}
            </div>
          </div>
          {(transaction.patientName || transaction.description) && (
            <div className="text-xs space-y-1 pt-2 border-t">
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
      <div className="p-3 text-center text-gray-500 text-sm">
        No transactions available.
      </div>
    )}
  </div>

  {allTransactions.length > 10 && allTransactions.length > transactionsLimit && (
    <div className="text-center py-2">
      <button
        onClick={() => setTransactionsLimit(prev => prev + 10)}
        className="text-blue-500 hover:text-blue-700 text-sm"
      >
        Show More
      </button>
    </div>
  )}
</div>

{/* Only show floating buttons when no modal is open */}
{!showInvoiceModal && !showCreateForm && !isSidebarOpen && (
  <div className="fixed bottom-4 right-4 flex flex-col gap-2">
    <button
      onClick={() => setShowInvoiceModal(true)}
      className="bg-black bg-opacity-35 text-white px-4 py-2 rounded-full hover:bg-opacity-90 shadow-lg text-sm"
    >
      + Invoice
    </button>
    <button 
      onClick={() => setShowCreateForm(!showCreateForm)}
      className="bg-black bg-opacity-35 text-white px-4 py-2 rounded-full hover:bg-opacity-90 shadow-lg text-sm"
    >
      + Transaction
    </button>
  </div>
)}
</div>
);
}