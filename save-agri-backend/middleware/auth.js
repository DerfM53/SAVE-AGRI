import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: "Format d'authentification invalide" 
    });
  }

  const token = authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: "Token d'authentification manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expiré, veuillez vous reconnecter" });
      }
      return res.status(403).json({ message: "Token invalide" });
    }

    req.user = user;
    next();
  });
};