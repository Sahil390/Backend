module.exports = function errorHandler(err, req, res, next) { 
  
  if (!err) return next();
  const status = err.status && Number(err.status) >= 400 ? Number(err.status) : 500;
  const payload = { message: err.message || 'Internal server error' };
  
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }
  console.error('ErrorHandler:', err.message || err);
  res.status(status).json(payload);
};
