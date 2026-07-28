import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { Box, Spinner } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ isAuthenticated, isAdmin, loading }) => {
  const context = useOutletContext();

  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bg="gray.50">
        <Spinner size="lg" color="teal.500" thickness="3px" />
      </Box>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={context} />;
};

ProtectedRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ProtectedRoute;
