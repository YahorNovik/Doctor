// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import { employerService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  console.log('Home component rendering');
  const [monthlyStats, setMonthlyStats] = useState({
    totalAmount: 0,
    totalEarnings: 0,
    transactionCount: 0,
    byEmployer: []
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          month: selectedMonth,
          year: selectedYear
        };
        const [transactionsRes, employersRes] = await Promise.all([
          transactionService.getAll(params),
          employerService.getAll()
        ]);

        const transactions = transactionsRes.data;
        const employers = employersRes.data;

        // Create a map of employers for easier lookup
        const employersMap = new Map(
          employers.map(employer => [employer._id, employer])
        );

        // Enrich transactions with employer names
        const enrichedTransactions = transactions.map(transaction => ({
          ...transaction,
          employerId: {
            ...transaction.employerId,
            name: employersMap.get(transaction.employerId._id || transaction.employerId)?.name || 'Unknown'
          }
        }));

        setTransactions(enrichedTransactions);

        // Calculate stats
        const stats = {
          totalAmount: 0,
          totalEarnings: 0,
          transactionCount: transactions.length,
          byEmployer: []
        };

        // Group by employer
        const employerStats = {};
        transactions.forEach(transaction => {
          stats.totalAmount += Number(transaction.amount);
          stats.totalEarnings += (Number(transaction.amount) * Number(transaction.percent)) / 100;

          const employerId = transaction.employerId._id || transaction.employerId;
          const employer = employersMap.get(employerId);

          if (!employerStats[employerId]) {
            employerStats[employerId] = {
              employerId: employerId,
              employerName: employer ? employer.name : 'Unknown',
              earnings: 0,
              amount: 0,
              transactionCount: 0
            };
          }

          employerStats[employerId].earnings += (Number(transaction.amount) * Number(transaction.percent)) / 100;
          employerStats[employerId].amount += Number(transaction.amount);
          employerStats[employerId].transactionCount += 1;
        });

        stats.byEmployer = Object.values(employerStats);
        setMonthlyStats(stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleEmployerClick = (employerId) => {
    navigate(`/employers/${employerId}`, { state: { from: 'dashboard' } });
  };

  const handleTransactionClick = (transactionId) => {
    navigate(`/transactions/${transactionId}`, { state: { from: 'dashboard' } });
  };

  if (loading) return <div className="p-8">Loading statistics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Monthly Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
          <p className="text-2xl font-bold text-green-600">{monthlyStats.totalEarnings.toFixed(2)} PLN</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Total Amount</h3>
          <p className="text-2xl font-bold">{monthlyStats.totalAmount.toFixed(2)} PLN</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Transactions</h3>
          <p className="text-2xl font-bold">{monthlyStats.transactionCount}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">By Employer</h2>
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Employer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Earnings</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Transactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {monthlyStats.byEmployer.map((stat) => (
              <tr 
                key={stat.employerId}
                onClick={() => handleEmployerClick(stat.employerId)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">{stat.employerName}</td>
                <td className="px-6 py-4 text-green-600">{stat.earnings.toFixed(2)} PLN</td>
                <td className="px-6 py-4">{stat.amount.toFixed(2)} PLN</td>
                <td className="px-6 py-4">{stat.transactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="bg-white rounded-lg shadow-sm border">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Employer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">%</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map(transaction => (
              <tr 
                key={transaction._id}
                onClick={() => handleTransactionClick(transaction._id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{transaction.employerId.name}</td>
                <td className="px-6 py-4">{transaction.amount} PLN</td>
                <td className="px-6 py-4">{transaction.percent}%</td>
                <td className="px-6 py-4 text-green-600">
                  {(transaction.amount * transaction.percent / 100).toFixed(2)} PLN
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}