import { Spinner } from '../components/Spinner'; 
import PropTypes from 'prop-types';

export const LoadingOverlay = ({ message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Spinner size="large" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );

LoadingOverlay.propTypes = {
    message: PropTypes.string.isRequired
  };