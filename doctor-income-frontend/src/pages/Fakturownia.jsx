import { useState, useEffect } from 'react';
import { profileService, employerService, productService } from '../services/api';

const formatCompanyName = (name) => {
  return name
    .replace('SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ', 'Sp. z o.o.')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace('Z O.O.', 'z o.o.');
};

export default function Fakturownia() {
  const [apiToken, setApiToken] = useState('');
  const [domain, setDomain] = useState('');
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClients, setSelectedClients] = useState(new Set());
  const [syncResults, setSyncResults] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '' });
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profileResponse, productsResponse] = await Promise.all([
          profileService.getAllProfiles(),
          productService.getAll()
        ]);

        if (profileResponse.data?.[0]) {
          setApiToken(profileResponse.data[0].apiToken || '');
          setDomain(profileResponse.data[0].domain || '');
        }
        
        setProducts(productsResponse.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchInitialData();
  }, []);
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${domain}.fakturownia.pl/clients.json?api_token=${apiToken}&page=1`
      );
      const data = await response.json();
      setClients(data);
      setShowClientsModal(true);
    } catch (err) {
      setError('Failed to fetch clients: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await productService.create(newProduct);
      const response = await productService.getAll();
      setProducts(response.data);
      setNewProduct({ name: '' });
      setShowProductsModal(false);
    } catch (err) {
      setError('Failed to create product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await productService.delete(productToDelete);
      setProducts(products.filter(p => p._id !== productToDelete));
      setProductToDelete(null);
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleClient = (clientId) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      newSet.has(clientId) ? newSet.delete(clientId) : newSet.add(clientId);
      return newSet;
    });
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const results = [];

      for (const client of clients.filter(c => selectedClients.has(c.id))) {
        try {
          let existingEmployer = null;
          try {
            const response = await employerService.getByNip(client.tax_no);
            existingEmployer = response.data;
          } catch (error) {
            if (error.response?.status !== 404) {
              throw error;
            }
          }

          const employerData = {
            name: formatCompanyName(client.name),
            nip: client.tax_no,
            regon: client.regon || existingEmployer?.regon || '',
            city: client.city || existingEmployer?.city || '',
            street: client.street || existingEmployer?.street || '',
            buildingNumber: client.building_number || existingEmployer?.buildingNumber || '',
            defaultPercent: existingEmployer?.defaultPercent || 100,
            fakturownia_id: client.id
          };

          if (existingEmployer?._id) {
            await employerService.update(existingEmployer._id, employerData);
            results.push({ nip: client.tax_no, status: 'updated' });
          } else {
            console.log('Creating employer:', employerData);
            try {
              await employerService.create(employerData);
              results.push({ nip: client.tax_no, status: 'created' });
            } catch (err) {
              console.error('Create error:', {
                message: err.message,
                response: err.response?.data
              });
              throw err;
            }
          }
        } catch (err) {
          console.error('Error processing client:', err);
          results.push({ nip: client.tax_no, status: 'failed', error: err.message });
        }
      }

      setSyncResults(results);
      setShowClientsModal(false);
      setSelectedClients(new Set());
    } catch (err) {
      setError('Sync failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Fakturownia Integration</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Clients Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">API Token</label>
              <input
                type="password"
                value={apiToken}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
          </div>

          <button
            onClick={fetchClients}
            disabled={loading || !apiToken || !domain}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Get Clients'}
          </button>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Products</h2>
            <button
              onClick={() => setShowProductsModal(true)}
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Add Product
            </button>
          </div>

          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Created At</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && <div className="mt-4 text-red-500">{error}</div>}

        {syncResults.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Sync Results:</h3>
            <ul className="mt-2">
              {syncResults.map((result, index) => (
                <li key={index} className={`text-sm ${result.status === 'failed' ? 'text-red-500' : 'text-green-500'}`}>
                  {result.nip}: {result.status} {result.error && `(${result.error})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Delete Product</h2>
            <p className="mb-4">Are you sure you want to delete this product?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-red-400"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button
                onClick={() => setShowProductsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProductsModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clients Modal */}
      {showClientsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Clients List</h2>
              <button
                onClick={() => setShowClientsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Select</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">NIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">{formatCompanyName(client.name)}</td>
                    <td className="px-6 py-4">{client.tax_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleSync}
                disabled={selectedClients.size === 0 || loading}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Syncing...' : 'Sync Selected'}
              </button>
              <button
                onClick={() => setShowClientsModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
