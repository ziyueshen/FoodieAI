const jwt = require('jsonwebtoken');
const secretKey = process.env.secretKey;

// 中间件用于解析认证令牌
module.exports.authenticateToken = (req, res, next) => {
    // 从请求头中提取认证令牌
    const authToken = req.headers.authorization?.split(' ')[1];

    // 如果没有认证令牌，返回未授权错误
    if (!authToken) {
      return res.status(401).json({ message: 'No token, Unauthorized' });
    }
  
    // 解析认证令牌
    jwt.verify(authToken, secretKey, (err, decoded) => {
      if (err) {
        // 认证失败，返回错误响应
        return res.status(401).json({ message: 'Failed in authorization, Unauthorized' });
      }
  
      // 认证成功，将用户信息附加到请求对象中，以便后续处理中使用
      req.user = decoded;
      next();
    });
  };