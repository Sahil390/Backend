

module.exports = function logger(req, res, next) {
  const start = Date.now();
  
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const msg = `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (method === 'POST' || method === 'PUT') {
      let preview;
      try { preview = JSON.stringify(req.body); } catch (e) { preview = '[unserializable]'; }
      const previewShort = preview && preview.length > 200 ? preview.slice(0,200) + '…' : preview;
      console.log(msg + ' ' + previewShort);
    } else {
      console.log(msg);
    }
  });

  next();
};
