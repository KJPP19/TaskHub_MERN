const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

const decryptHashedPassword = async (requestPassword, storedPassword) => {
  const decryptedPassword = await bcrypt.compare(
    requestPassword,
    storedPassword,
  );
  return decryptedPassword;
};

module.exports = {
  hashPassword,
  decryptHashedPassword,
};
