const { NODE_BACKEND_HOSTNAME } = process.env;

export const environment = {
  production: true,
  apiUrl: `${NODE_BACKEND_HOSTNAME}:3000/api/`
};
