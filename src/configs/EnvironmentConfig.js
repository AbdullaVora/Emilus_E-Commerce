// EnvironmentConfig.js
const dev = {
	API_ENDPOINT_URL: '/api'
  };
  
  const prod = {
	API_ENDPOINT_URL: '/api'
  };
  
  const test = {
	API_ENDPOINT_URL: '/api'
  };
  
  const getEnv = () => {
	switch (process.env.NODE_ENV) {
	  case 'development':
		return dev;
	  case 'production':
		return prod;
	  case 'test':
		return test;
	  default:
		return dev; // Default to development
	}
  };
  
  export const env = getEnv();