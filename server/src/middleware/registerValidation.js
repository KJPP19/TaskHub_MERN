const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const validateRegisterUser = (req, res, next) => {
  const { email, firstname, lastname, password } = req.body;
  if (!email || !firstname || !lastname || !password) {
    return res.status(400).json({ error: "all fields are required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "invalid email format" });
  }
  next();
};

module.exports = validateRegisterUser;
