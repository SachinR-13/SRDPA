const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  const logger = require("./utils/logger");

logger.info(`🚀 Server Running on Port ${PORT}`);
});
const logger = require("./utils/logger");