const express = require('express');
const app = express();
const port = 4321; // Choose a port number

app.use(express.static("./")); // Serve static files from the current directory

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});