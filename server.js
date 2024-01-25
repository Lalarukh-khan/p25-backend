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
app.get('/get-mattypes', (request, response) => {
    const selectQuery = 'SELECT * FROM material_types';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
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
	// console.log('Received request:', request.body);
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
app.post('/add-material-bulk', upload.none(),  (request, response) => {
	const component = request.body.component;
	const model = request.body.model;
	const description = request.body.description;
	const partno = request.body.partno;
	const type = request.body.type;
	const quantity = request.body.quantity;
	const category = request.body.category;
	const subcategory = request.body.subcategory;
	const activeButtonText = request.body.activeButtonText;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const getIdByName = (tableName, columnName, value) => {
	return new Promise((resolve, reject) => {
	  pool.query(`SELECT id FROM ${tableName} WHERE ${columnName} = ?`, [value], (error, results) => {
		if (error) {
		  reject(error);
		} else {
		  resolve(results.length > 0 ? results[0][`id`] : null);
		}
	  });
	});
  	};
  Promise.all([
	getIdByName('material_category', 'name', category),
	getIdByName('subcategory', 'name', subcategory),
	getIdByName('material_types', 'name', type)
  ])
	.then(([categoryId, subcategoryId, typeId]) => {
	  pool.query(
		'INSERT INTO material (component, model, description, partno, type, quantity, slctcateg, slctsubcateg, activeButtonText, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [component, model, description, partno, typeId, quantity, categoryId, subcategoryId, activeButtonText, created_at, created_at], (error, results, fields) => {
		  if (error) {
			return response.status(500).json({ error: 'Error inserting into the database' });
		  }
		  return response.json({ message: `Response: Material created successfully!` });
		}
	  );
	})
	.catch(error => {
	  return response.status(500).json({ error: 'Error querying the database for IDs' });
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
app.post('/get-materialbytype', upload.none(),  (request, response) => {
	const matid = request.body.matid;
  pool.query(`SELECT * FROM material WHERE type = '${matid}'`, (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Material not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Material not created in database' });
	}
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
	const shipid = request.body.shipid;
	const name = request.body.name;
	const from = request.body.from;
	const slctcateg = request.body.slctcateg;
	const slctsubcateg = request.body.slctsubcateg;
	const slctmat = request.body.slctmat;
	const slcttype = request.body.slcttype;
	const packingno = request.body.packingno;
	const quantity = request.body.quantity;
	const shipmentqty = request.body.shipmentqty;
	const receivedqty = request.body.receivedqty;
	const remainingqty = request.body.remainingqty;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  pool.query('INSERT INTO shipment (shipid, name, shpfrom, slctcateg, slctsubcateg, slctmat, slcttype, packingno, quantity, shipmentqty, receivedqty, remainingqty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [shipid, name, from, slctcateg, slctsubcateg, slctmat, slcttype, packingno, quantity, shipmentqty, receivedqty, remainingqty, created_at, created_at], (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Shipment not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Shipment not created in database' });
	}
    return response.json({ message: 'Response: Shipment created successfully!'});
  });
});
app.get('/get-shipments', (request, response) => {
    const selectQuery = 'SELECT * FROM shipment';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	});
});
app.post('/get-shipmentvalues', upload.none(),  (request, response) => {
	const shpid = request.body.shpid;
  pool.query(`SELECT 
  shipment.packingno, 
  shipment.quantity, 
  shipment.receivedqty,
  shipment.remainingqty, 
  material_category.name AS categoryname,
  material.component AS materialname,
  material.description AS materialdescription,
  material.activeButtonText AS materialunit,
  subcategory.name AS subcategoryname, 
  material_types.name AS typename
 FROM shipment 
 JOIN material_category ON shipment.slctcateg = material_category.id 
 JOIN material ON shipment.slctmat = material.id 
 JOIN subcategory ON shipment.slctsubcateg = subcategory.id 
 JOIN material_types ON shipment.slcttype = material_types.id  
 WHERE shipment.id = '${shpid}'`, (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Shipment not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Shipment not created in database' });
	}
	return response.json({ data: results });
  });
});
app.post('/add-manufecturer', upload.none(),  (request, response) => {
	const mnfid = request.body.mnfid;
	const mnfname = request.body.mnfname;
	const mnflocation = request.body.mnflocation;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO manufacture (mnfid, mnfname, mnflocation, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [mnfid, mnfname, mnflocation, created_at, created_at], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Manufacturer not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Manufacturer not created in database' });
		}
		return response.json({ message: 'Response: Manufacturer created successfully!'});
	});
});
app.get('/get-manufacturers', (request, response) => {
    const selectQuery = 'SELECT * FROM manufacture';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	});
});
app.post('/add-serial', upload.none(),  (request, response) => {
	const serial_id = request.body.matsid;
	const slctshipment = request.body.slctshipment;
	const shpquantity = request.body.shpquantity;
	const slctmnf_id = request.body.slctmnf_id;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO material_serial (serial_id, slctshipment, shpquantity, slctmnf_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [serial_id, slctshipment, shpquantity, slctmnf_id, created_at, created_at], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Serial not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Serial not created in database' });
		}
		return response.json({ message: 'Response: Serial created successfully!'});
	});
});
app.post('/add-serial-bulk', upload.none(),  (request, response) => {
	const serial_id = request.body.serial_id;
	const slctshipment = request.body.shipment_id;
	const shpquantity = request.body.quantity;
	const slctmnf_id = request.body.manufacturer_name;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('SELECT mnfid FROM manufacture WHERE mnfname = ?', [slctmnf_id], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Error querying the database' });
		}
	  
		if (results.length === 0) {
		  return response.status(500).json({ error: 'Manufacturer not found in the database' });
		}
	  
		const slctmnf_id = results[0].mnfid;
	  
		// Now, you have the manufacturer_id, you can proceed with the INSERT operation
		pool.query(
		  'INSERT INTO material_serial (serial_id, slctshipment, shpquantity, slctmnf_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
		  [serial_id, slctshipment, shpquantity, slctmnf_id, created_at, created_at],
		  (error, results, fields) => {
			if (error) {
			  return response.status(500).json({ error: 'Error inserting into the database' });
			}
	  
			return response.json({ message: 'Response: Serial created successfully!' });
		  }
		);
	  });
});
app.post('/add-warehouse', upload.none(),  (request, response) => {
	const mnfid = request.body.mnfid;
	const mnfname = request.body.mnfname;
	const mnflocation = request.body.mnflocation;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO warehouse (wrhid, wrhidname, wrhidlocation, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [mnfid, mnfname, mnflocation, created_at, created_at], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Warehouse not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Warehouse not created in database' });
		}
		return response.json({ message: 'Response: Warehouse created successfully!'});
	});
});
app.get('/get-warehouse', (request, response) => {
    const selectQuery = 'SELECT * FROM warehouse';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	});
});
app.post('/add-site', upload.none(),  (request, response) => {
	const mnfid = request.body.mnfid;
	const mnfname = request.body.mnfname;
	const mnflocation = request.body.mnflocation;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO site (siteid, sitename, sitelocation, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [mnfid, mnfname, mnflocation, created_at, created_at], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Site not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Site not created in database' });
		}
		return response.json({ message: 'Response: Site created successfully!'});
	});
});
app.get('/get-site', (request, response) => {
    const selectQuery = 'SELECT * FROM site';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	});
});
app.post('/add-company', upload.none(),  (request, response) => {
	const mnfid = request.body.mnfid;
	const mnfname = request.body.mnfname;
	const mnflocation = request.body.mnflocation;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO company (compid, compname, complocation, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [mnfid, mnfname, mnflocation, created_at, created_at], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Company not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Company not created in database' });
		}
		return response.json({ message: 'Response: Company created successfully!'});
	});
});
app.get('/get-company', (request, response) => {
    const selectQuery = 'SELECT * FROM company';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	});
});
app.post('/add-user', upload.none(),  (request, response) => {
	const fullname = request.body.fullname;
	const email = request.body.email;
	const role = request.body.role;
	const username = request.body.username;
	const password = request.body.password;
	const mobile = request.body.mobile;
	const emergency = request.body.emergency;
	const address = request.body.address;
	const status = "Active";
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO users (fullname, email, role, username, password, mobile, emergency, address, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [fullname, email, role, username, password, mobile, emergency, address, status, created_at, created_at], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'User not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User not created in database' });
		}
		return response.json({ message: 'Response: User created successfully!'});
	});
});
app.get('/get-user', (request, response) => {
    const selectQuery = 'SELECT * FROM users';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	});
});
app.get('/get-role', (request, response) => {
    const selectQuery = 'SELECT * FROM user_role';
	pool.query(selectQuery, (error, results, fields) => {
		if (error) {
		//   console.error('Error selecting from MySQL:', error);
		  return response.status(500).json({ error: 'Internal Server Error' });
		}
		// console.log('Data selected from MySQL:', results);
		return response.json({ data: results });
	});
});
app.post('/update-role', upload.none(),  (request, response) => {
	const role = request.body.role;
	const add_material = request.body.add_material;
	const mcategory = request.body.mcategory;
	const msn = request.body.msn;
	const manufacture = request.body.manufacture;
	const shipment = request.body.shipment;
	const warehouse = request.body.warehouse;
	const site = request.body.site;
	const company = request.body.company;
	const sitereq = request.body.sitereq;
	const createreq = request.body.createreq;
	const requpdate = request.body.requpdate;
	const userinfo = request.body.userinfo;
	const rolecontrol = request.body.rolecontrol;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('UPDATE user_role SET add_material = ?, mcategory = ?, msn = ?, manufacture = ?, shipment = ?, warehouse = ?,  site = ?,  company = ?,  sitereq = ?,  createreq = ?,  requpdate = ?, userinfo = ?, rolecontrol = ?, updated_at = ? WHERE role = ?', [add_material, mcategory, msn, manufacture, shipment, warehouse, site, company, sitereq, createreq, requpdate, userinfo, rolecontrol, updated_at, role], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Role not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Role not updated in database' });
		}
		return response.json({ message: 'Response: Role updated successfully!'});
	});
});
