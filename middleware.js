const jwt = require('jsonwebtoken');
const secretKey = process.env.secretKey;

module.exports.authenticateToken = (req, res, next) => {
    const authToken = req.headers.authorization?.split(' ')[1];

    if (!authToken) {
      return res.status(401).json({ message: 'No token, Unauthorized' });
    }
  
    jwt.verify(authToken, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Failed in authorization, Unauthorized' });
      }
  
      req.user = decoded;
      next();
    });
  };