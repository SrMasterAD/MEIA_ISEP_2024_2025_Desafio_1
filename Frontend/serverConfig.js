const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

// Basic route for the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/mainPage.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});