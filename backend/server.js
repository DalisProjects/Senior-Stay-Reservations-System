const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser'); // Import body-parser for parsing request bodies
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');const PORT = process.env.PORT || 3000;
const cors = require('cors'); // Import the cors package
const jwt = require('jsonwebtoken');
const email = require('./email');
const paypal = require('@paypal/checkout-server-sdk');

// Set up PayPal SDK
const clientId = 'AeaNL87M_VFadPZveZNsKvcuDUnTC0WlDmqq8eG2Gg7DSWo5QzCNAZK10hBQHnUZKImkgkYq66Wrv1kA';
const clientSecret = 'ENyTqoektaBoywmSVAnBW9iNK7jXY0ycJS3L3yszc8iqMn1JB_cUmROSDi7WKX-9x7ek6Bi3OxPBqO-a';

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);
app.use(email);
app.use(cors());




// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost', // '192.168.0.136',
  user: 'root',
  password: 'dali',
  database: 'axadb'
});



connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log(`Connected to MySQL database as id` + connection.threadId);
});


const storages = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../src/assets/images/hotels');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const uploads = multer({ storage: storages });

const storagesroom = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../src/assets/images/hotels/rooms');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadsroom = multer({ storage: storagesroom });

app.post('/api/uploadtoroom/:roomId', uploadsroom.array('images'), (req, res) => {
  // Process uploaded images
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  // Get the proprety ID from the request parameters
  const roomId = req.params.roomId;
  // Process files here
  const newImagePaths = req.files.map(file => 'assets/images/hotels/rooms/' + file.filename);
  // Concatenate file paths into a single string
  const imagePathsString = newImagePaths.join(',');

  // Update the image_paths column in the database
  connection.query('UPDATE suite SET image_paths = ? WHERE RoomID = ?', [imagePathsString, roomId], (error, results) => {
    if (error) {
      console.error('Failed to update Room image paths:', error);
      res.status(500).json({ error: 'Failed to update Room image paths' });
    } else {
      console.log('Room Image paths updated successfully');
      res.status(201).json({ message: 'Room image paths updated successfully' });
    }
  });
});

app.post('/api/uploadtohotel/:propretyId', uploads.array('images'), (req, res) => {
  // Process uploaded images
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // Get the proprety ID from the request parameters
  const propretyId = req.params.propretyId;

  // Process files here
  const newImagePaths = req.files.map(file => 'assets/images/hotels/' + file.filename);

  // Concatenate file paths into a single string
  const imagePathsString = newImagePaths.join(',');

  // Update the image_paths column in the database
  connection.query('UPDATE proprety SET image_paths = ? WHERE HotelID = ?', [imagePathsString, propretyId], (error, results) => {
    if (error) {
      console.error('Failed to update image paths:', error);
      res.status(500).json({ error: 'Failed to update proprety image paths' });
    } else {
      console.log('Hotel Image paths updated successfully');
      res.status(201).json({ message: 'Hotel image paths updated successfully' });
    }
  });
});


// Middleware to parse request bodies as JSON
app.use(bodyParser.json());

function verifyToken(req, res, next) {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
    return res.status(403).json({ error: 'Token is required' });
  }
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }
    req.decoded = decoded;
    next();
  });
}

// Route to verify token
app.post('/api/verifyToken', (req, res) => {

  
  res.status(200).json({ user: req.decoded });
});

// Define route to serve Angular application's index.html file
app.get('/', (req, res) => {
  res.sendFile(path.resolve('D:/Desktop/Internship_project/src/index.html'));
});
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'app')));



app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Validate user credentials
  connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to authenticate user' });
    } else if (results.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
    } else {
      // User authenticated successfully, generate token
      const token = jwt.sign({ email }, 'secret');//, { expiresIn: '1h' });
      res.status(200).json({ token, user: results[0] }); // Send token and user data in response
    }
  });
});
// Define route to create a new user
app.post('/api/users', (req, res) => {
  const newUser = req.body; // Get user data from request body
  
  // Check if email already exists
  connection.query('SELECT * FROM users WHERE email = ?', newUser.email, (error, results) => {
      if (error) {
          res.status(500).json({ error: 'Failed to create user' });
      } else if (results.length > 0) {
          res.status(400).json({ error: 'Email already in use' }); // Return error if email already exists
      } else {
          // Email does not exist, proceed with creating the user
          connection.query('INSERT INTO users SET ?', newUser, (error, results) => {
              if (error) {
                  res.status(500).json({ error: 'Failed to create user' });
              } else {
                const token = jwt.sign({ email: newUser.email }, 'secret', { expiresIn: '1h' });
                  res.status(201).json({ message: 'User created successfully', userId: results.insertId , token});
              }
          });
      }
  });
});

// Define route to update a user by ID
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body; // Get updated user data from request body
  connection.query('UPDATE users SET ? WHERE id = ?', [updatedUserData, userId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to update user' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json({ message: 'User updated successfully' });
    }
  });
});

// Define route to update a user by email
app.put('/api/users/email/:email', (req, res) => {
  const userEmail = req.params.email;
  const updatedUserData = req.body; // Get updated user data from request body
  connection.query('UPDATE users SET ? WHERE email = ?', [updatedUserData, userEmail], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to update user' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json({ message: 'User updated successfully' });
    }
  });
});
// Define route to retrieve a specific user by email
app.get('/api/users/:email', (req, res) => {
  const useremail = req.params.email;
  connection.query('SELECT * FROM users WHERE email = ?', [useremail], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(results[0]); // Return only the first user found
    }
  });
});
// Define route to retrieve a specific user by email
app.get('/api/users/id/:id', (req, res) => {
  const userid = req.params.id;
  connection.query('SELECT * FROM users WHERE id = ?', [userid], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(results[0]); // Return only the first user found
    }
  });
});

// Define route to retrieve all users
app.get('/api/users', (req, res) => {
  connection.query('SELECT * FROM users', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve users' });
    } else {
      res.status(200).json(results);
    }
  });
});



// Define route to retrieve a specific user by ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  connection.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});




// Define route to delete a user by ID
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  connection.query('DELETE FROM users WHERE id = ?', [userId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json({ message: 'User deleted successfully' });
    }
  });
});






app.get('/api/hotel', (req, res) => {
  connection.query('SELECT * FROM proprety', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve propretys' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Route to add a new proprety
app.post('/api/hotel', verifyToken, (req, res) => {
  const newHotel = req.body;
  connection.query('INSERT INTO proprety SET ?', newHotel, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to add proprety' });
    } else {
      res.status(201).json({ message: 'Hotel added successfully', propretyHotelID: results.insertId });
    }
  });
});
// Route to add a new proprety
app.post('/api/hotel/room', verifyToken, (req, res) => {
  const newRoom = req.body;
  connection.query('INSERT INTO suite SET ?', newRoom, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to add room' });
    } else {
      res.status(201).json({ message: 'Room added successfully', RoomID: results.insertId });
    }
  });
});

app.get('/api/hotel/:HotelID/rooms', (req, res) => {
  const propretyID = req.params.HotelID;
  connection.query('SELECT * FROM suite WHERE HotelID = ?', [propretyID], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve proprety rooms' });
    } else if (results.length === 0) {
      res.status(200).json([]); // Return an empty array if no rooms found
    } else {
      res.status(200).json(results); // Return rooms found
    }
  });
});

// Define a new endpoint to get a specific suite by ID
app.get('/api/hotel/:propretyId/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const propretyId = req.params.propretyId;
  connection.query('SELECT * FROM suite WHERE RoomID = ? AND HotelID = ? AND Availability = TRUE', [roomId, propretyId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve suite data' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Room not found' });
    } else {
      res.status(200).json(results[0]); // Return the first suite found (assuming RoomID is unique)
    }
  });
});

app.get('/api/hotel/:propretyId/rooms/available', async (req, res) => {
  const propretyId = parseInt(req.params.propretyId);

  try {
    const { rows } = await connection.query(
      'SELECT * FROM rooms WHERE HotelID = $1 AND Availability = TRUE',
      [propretyId]
    );

    res.json(rows); // Send available rooms

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching available rooms');
  }
});

app.get('/api/hotel/:HotelID', (req, res) => {
  const propretyID = req.params.HotelID;
  connection.query('SELECT * FROM proprety WHERE HotelID = ?', [propretyID], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve proprety' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'User not proprety' });
    } else {
      res.status(200).json(results[0]); // Return only the first user found
    }
  });
});

// Route to edit an existing proprety
app.put('/api/hotel/:id', verifyToken, (req, res) => {
  const propretyId = req.params.id;
  const updatedHotel = req.body;
  connection.query('UPDATE proprety SET ? WHERE HotelID = ?', [updatedHotel, propretyId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to update proprety' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Hotel not found' });
    } else {
      res.status(200).json({ message: 'Hotel updated successfully' });
    }
  });
});

// Route to delete a proprety
app.delete('/api/hotel/:id', verifyToken, (req, res) => {
  const { propretyId, imagePaths } = req.body;
  let imagePathsp = [];
  if (imagePaths) {
    imagePathsp = imagePaths.split(',');
  }
  connection.query('DELETE FROM proprety WHERE HotelID = ?', [propretyId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to delete proprety ' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Hotel not found' });
    } else {
      res.status(200).json({ message: 'Hotel deleted successfully' });
    }
  });  imagePathsp.forEach(path => {
      const imagePath = '../src/' + path.trim(); // Construct the path to the image file
      try {
        fs.unlinkSync(imagePath); // Delete the image file
        console.log('Image deleted successfully !');
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    });

   
});
// Define a new endpoint to get a specific suite by ID
app.get('/api/hotel/:propretyId/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const propretyId = req.params.propretyId;
  connection.query('SELECT * FROM suite WHERE RoomID = ? AND HotelID = ? AND Availability = TRUE', [roomId, propretyId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve suite data' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Room not found' });
    } else {
      res.status(200).json(results[0]); // Return the first suite found (assuming RoomID is unique)
    }
  });
});
app.get('/api/hotel/:propretyId/:roomId/unavailable-dates', (req, res) => {
  const propretyId = req.params.propretyId;
  const roomId = req.params.roomId;
  console.log(propretyId, roomId);
  try {
    // Query the database to fetch unavailable dates for the specified proprety
    connection.query('SELECT StartDate, EndDate FROM suite WHERE HotelID = ? AND RoomID = ?', [propretyId, roomId], (error, results) => {
      if (error) {
        console.error('Failed to fetch unavailable dates:', error);
        res.status(500).json({ error: 'Failed to fetch unavailable dates' });
      } else {
        // Extract the unavailable dates from the query result
        const dates = results.map(row => ({
          startDate: row.StartDate,
          endDate: row.EndDate
        }));
        // Send the unavailable dates as a JSON response
        res.json(dates);
      }
    });
  } catch (error) {
    console.error('Failed to fetch unavailable dates:', error);
    res.status(500).json({ error: 'Failed to fetch unavailable dates' });
  }
});

// Endpoint for initiating payment
app.post('/api/initiate-payment', async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount.toFixed(2)
      }
    }]
  });

  try {
    const response = await client.execute(request);
    // Check if the response contains the approval URL
    const approvalUrl = response.result.links.find(link => link.rel === 'approve').href;
    res.status(200).json({ orderId: response.result.id, redirectUrl: approvalUrl });
  } catch (error) {
    console.error('Error initiating payment:', error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});


// Endpoint for capturing payment
app.post('/api/capture-payment', async (req, res) => {
  const { orderId } = req.body;

  console.log(orderId)
  const request = new paypal.orders.OrdersCaptureRequest(orderId);

  try {
    const response = await client.execute(request);
    res.status(200).json({ status: response.result.status });
  } catch (error) {
    console.error('Error capturing payment:', error.message);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

// Endpoint to fetch overall statistics
// Endpoint to fetch overall statistics for a specific time period
// Endpoint to fetch overall statistics
app.get('/api/overall-statistics', (req, res) => {
  connection.query('SELECT * FROM statistics', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve overall statistics' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint to fetch statistics based on selected time period
app.get('/api/statistics/:timePeriod', (req, res) => {
  const timePeriod = req.params.timePeriod;
  let query;
  console.log(timePeriod)
  // Adjust query based on selected time period
  switch (timePeriod) {
    case 'last24':
      query = 'SELECT * FROM statistics WHERE DateAdded >= NOW() - INTERVAL 24 HOUR';
      break;
    case 'lastWeek':
      query = 'SELECT * FROM statistics WHERE DateAdded >= NOW() - INTERVAL 1 WEEK';
      break;
    case 'lastMonth':
      query = 'SELECT * FROM statistics WHERE DateAdded >= NOW() - INTERVAL 1 MONTH';
      break;
    case 'lastYear':
      query = 'SELECT * FROM statistics WHERE DateAdded >= NOW() - INTERVAL 1 YEAR';
      break;
    default:
      return res.status(400).json({ error: 'Invalid time period' });
  }
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve statistics for the selected time period' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Backend Route to Fetch Revenue Breakdown by Booking Type
app.get('/api/revenue-by-booking-type', (req, res) => {
  const query = `
    SELECT BookingType, SUM(TotalRevenue) AS Revenue
    FROM statistics
    GROUP BY BookingType;
  `;
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to retrieve revenue breakdown' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/api/addstat', verifyToken, (req, res) => {
  const newRoom = req.body;
  connection.query('INSERT INTO statistics SET ?', newRoom, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to add statistics' });
    } else {
      res.status(201).json({ message: 'statistics added successfully', RoomID: results.insertId });
    }
  });
});
// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

