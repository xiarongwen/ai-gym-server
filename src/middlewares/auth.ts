import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 扩展 Express 的 Request 接口，添加 user 属性
interface User {
  _id: string;
  email: string;
  role: string;
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret',
    ) as any;

    // 将解码后的用户信息添加到请求对象
    req.user = {
      _id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error('认证失败:', error);
    return res.status(401).json({ error: '认证失败' });
  }
};
