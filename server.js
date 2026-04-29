import io from './src/socket/socket.js';
import connectDB from "./src/config/db.js";


const PORT = process.env.PORT || 3001;

connectDB()



io.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});