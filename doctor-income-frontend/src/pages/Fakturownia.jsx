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
    // ... rest of handleSync function remains the same
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6 pl-8 md:pl-0">Fakturownia Integration</h1>

      <div className="space-y-6">
        {/* Credentials Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <div className="space-y-4">
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
            className="mt-4 w-full md:w-auto bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Get Clients'}
          </button>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold">Products</h2>
            <button
              onClick={() => setShowProductsModal(true)}
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Add Product
            </button>
          </div>

          {/* Desktop Products Table */}
          <div className="hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4 text-right">
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

          {/* Mobile Products List */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{product.name}</div>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No products found
              </div>
            )}
          </div>
        </div>

        {error && <div className="mt-4 text-red-500">{error}</div>}

        {syncResults.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-2">Sync Results:</h3>
            <ul className="space-y-1">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Clients List</h2>
                <button
                  onClick={() => setShowClientsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {/* Desktop Clients Table */}
              <div className="hidden md:block">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
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
              </div>

              {/* Mobile Clients List */}
              <div className="md:hidden space-y-3">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div>
                        <div className="font-medium">{formatCompanyName(client.name)}</div>
                        <div className="text-sm text-gray-500">NIP: {client.tax_no}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClientsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSync}
                  disabled={selectedClients.size === 0 || loading}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? 'Syncing...' : `Sync Selected (${selectedClients.size})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}