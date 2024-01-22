const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2');

const app = express();
app.use(cors());
const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: 'mysql',
	database: 'razu',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
  });

app.listen(5000, () => {
    console.log('Server running!');
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/login', upload.none(),  (request, response) => {
	// console.log('Received request:', request.body);
	const email = request.body.email;
	const password = request.body.password;
  pool.query(`SELECT * FROM admin WHERE email = '${email}' AND password = '${password}'`, (error, results, fields) => {
    if (error) {
    //   console.error('Admin not found:', error);
      return response.status(500).json({ error: 'Admin not found' });
    }
	if(results.length === 0){
		// console.log('Admin not found in database', results);
		return response.status(500).json({ error: 'Admin not found in database' });
	}
    // console.log('User logged in successfully', results);
    return response.json({ message: 'Response: User logged in successfully!'});
  });
});

app.post('/make-category', upload.none(),  (request, response) => {
	// console.log('Received request:', request.body);
	const category = request.body.category;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  pool.query('INSERT INTO material_category (name, created_at, updated_at) VALUES (?, ?, ?)', [category, created_at, created_at], (error, results, fields) => {
    if (error) {
    //   console.error('Category not created:', error);
      return response.status(500).json({ error: 'Admin not found' });
    }
	if(results.length === 0){
		// console.log('Admin not found in database', results);
		return response.status(500).json({ error: 'Category not created in database' });
	}
    // console.log('User logged in successfully', results);
    return response.json({ message: 'Response: Category created successfully!'});
  });
});
app.get('/get-categories', (request, response) => {
    const selectQuery = 'SELECT * FROM material_category';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	  });
});
app.post('/make-subcategory', upload.none(),  (request, response) => {
	const subcategory = request.body.subcategory;
	const categid = request.body.categid;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  pool.query('INSERT INTO subcategory (name, category_id, created_at, updated_at) VALUES (?, ?, ?, ?)', [subcategory, categid, created_at, created_at], (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Admin not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Category not created in database' });
	}
    return response.json({ message: 'Response: SubCategory created successfully!'});
  });
});
app.post('/get-subcategory', upload.none(),  (request, response) => {
	const categid = request.body.categid;
  pool.query(`SELECT * FROM subcategory WHERE category_id = '${categid}'`, (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Admin not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Category not created in database' });
	}
	return response.json({ data: results });
  });
});
app.post('/add-material', upload.none(),  (request, response) => {
	const component = request.body.component;
	const model = request.body.model;
	const description = request.body.description;
	const partno = request.body.partno;
	const type = request.body.type;
	const quantity = request.body.quantity;
	const slctcateg = request.body.slctcateg;
	const slctsubcateg = request.body.slctsubcateg;
	const activeButtonText = request.body.activeButtonText;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  pool.query('INSERT INTO material (component, model, description, partno, type, quantity, slctcateg, slctsubcateg, activeButtonText, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [component, model, description, partno, type, quantity, slctcateg, slctsubcateg, activeButtonText, created_at, created_at], (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Material not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Material not created in database' });
	}
    return response.json({ message: 'Response: Material created successfully!'});
  });
});
app.get('/get-material', (request, response) => {
    const selectQuery = 'SELECT * FROM material';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	  });
});
app.post('/get-materialvalues', upload.none(),  (request, response) => {
	const matid = request.body.matid;
  pool.query(`SELECT * FROM material WHERE id = '${matid}'`, (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Admin not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Category not created in database' });
	}
	return response.json({ data: results });
  });
});
app.post('/add-shipment', upload.none(),  (request, response) => {
	console.log('Received request:', request.body);
	const shipid = request.body.shipid;
	const name = request.body.name;
	const from = request.body.from;
	const slctcateg = request.body.slctcateg;
	const slctsubcateg = request.body.slctsubcateg;
	const slctmat = request.body.slctmat;
	const packingno = request.body.packingno;
	const quantity = request.body.quantity;
	const shipmentqty = request.body.shipmentqty;
	const receivedqty = request.body.receivedqty;
	const remainingqty = request.body.remainingqty;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  pool.query('INSERT INTO shipment (shipid, name, shpfrom, slctcateg, slctsubcateg, slctmat, packingno, quantity, shipmentqty, receivedqty, remainingqty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [shipid, name, from, slctcateg, slctsubcateg, slctmat, packingno, quantity, shipmentqty, receivedqty, remainingqty, created_at, created_at], (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Shipment not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Shipment not created in database' });
	}
    return response.json({ message: 'Response: Shipment created successfully!'});
  });
});
