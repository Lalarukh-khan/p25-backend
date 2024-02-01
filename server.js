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
  pool.query(`SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`, (error, results, fields) => {
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
app.post('/update-category', upload.none(),  (request, response) => {
	const categid = request.body.categid;
	const newname = request.body.newname;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  pool.query('UPDATE material_category SET name = ?, updated_at = ? WHERE id = ?', [newname, updated_at, categid], (error, results, fields) => {
    if (error) {
    //   console.error('Category not created:', error);
      return response.status(500).json({ error: 'Category not found' });
    }
	if(results.length === 0){
		// console.log('Admin not found in database', results);
		return response.status(500).json({ error: 'Category not updated in database' });
	}
    // console.log('User logged in successfully', results);
    return response.json({ message: 'Response: Category updated successfully!'});
  });
});
app.post('/delete-category', upload.none(),  (request, response) => {
	const categid = request.body.categid;
  pool.query('DELETE FROM material_category WHERE id = ?', [categid], (error, results, fields) => {
    if (error) {
    //   console.error('Category not created:', error);
      return response.status(500).json({ error: 'Category not Deleted' });
    }
    // console.log('User logged in successfully', results);
    return response.json({ message: 'Response: Category deleted successfully!'});
  });
});
app.get('/get-catsubcat', (request, response) => {
    const selectQuery = 'SELECT * FROM material_category';
    pool.query(selectQuery, (error, categories, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }
        const categoryData = categories.map(category => {
            return new Promise((resolve, reject) => {
                const subcategoryQuery = 'SELECT * FROM subcategory WHERE category_id = ?';
                pool.query(subcategoryQuery, [category.id], (error, subcategories) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    const categoryWithSubcategories = {
                        category_id: category.id,
                        category_name: category.name,
                        subcategories: subcategories
                    };
                    
                    resolve(categoryWithSubcategories);
                });
            });
        });
        
        // Wait for all promises to resolve
        Promise.all(categoryData)
            .then(result => {
                return response.json({ data: result });
            })
            .catch(error => {
                return response.status(500).json({ error: 'Internal Server Error' });
            });
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
  pool.query(`SELECT 
  material.id, 
  material.component, 
  material.model,
  material.description, 
  material.partno,
  material.quantity,
  material.activeButtonText,
  material_types.name AS type,
  material_category.name AS slctcateg,
  subcategory.name AS slctsubcateg
 FROM material 
 JOIN material_types ON material.type = material_types.id 
 JOIN material_category ON material.slctcateg = material_category.id 
 JOIN subcategory ON material.slctsubcateg = subcategory.id
 ORDER BY material.id DESC`, (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Material not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Material not created in database' });
	}
	return response.json({ data: results });
  });
});
app.post('/get-mattypesbysub', upload.none(),  (request, response) => {
	const subid = request.body.subid;
  pool.query(`SELECT type FROM material WHERE slctsubcateg = '${subid}'`, (error, results, fields) => {
    if (error) {
      return response.status(500).json({ error: 'Material not found' });
    }
	if(results.length === 0){
		return response.status(500).json({ error: 'Material not created in database' });
	}
	return response.json({ data: results });
  });
});
app.post('/get-materialbytype', upload.none(),  (request, response) => {
	const typeid = request.body.typeid;
	const subid = request.body.subid;
  pool.query(`SELECT id, component FROM material WHERE type = '${typeid}' AND slctsubcateg = '${subid}'`, (error, results, fields) => {
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
	const slctwrhs = request.body.slctwrhs;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  pool.query('INSERT INTO shipment (shipid, name, shpfrom, slctwrhs, slctcateg, slctsubcateg, slctmat, slcttype, packingno, quantity, shipmentqty, receivedqty, remainingqty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [shipid, name, from, slctwrhs, slctcateg, slctsubcateg, slctmat, slcttype, packingno, quantity, shipmentqty, receivedqty, remainingqty, created_at, created_at], (error, results, fields) => {
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
app.get('/get-allshipments', (request, response) => {
	pool.query(`SELECT 
	shipment.shipid,
	shipment.name,
	shipment.shpfrom,
	warehouse.wrhidname AS warehousename,
	material_category.name AS categoryname,
	subcategory.name AS subcategoryname,
	material.component AS materialname,
	material_types.name AS typename,
	shipment.packingno,
	shipment.quantity,
	shipment.shipmentqty,
	shipment.receivedqty,
	shipment.remainingqty
   FROM shipment 
   JOIN material_category ON shipment.slctcateg = material_category.id 
   JOIN material ON shipment.slctmat = material.id 
   JOIN warehouse ON shipment.slctwrhs = warehouse.id 
   JOIN subcategory ON shipment.slctsubcateg = subcategory.id 
   JOIN material_types ON shipment.slcttype = material_types.id
   ORDER BY shipment.id DESC`, (error, results, fields) => {
		if (error) {
		return response.status(500).json({ error: 'Shipment not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Shipment not created in database' });
		}
		return response.json({ data: results });
	});
});
app.post('/get-shipmentvalues', upload.none(),  (request, response) => {
	const shpid = request.body.shpid;
  pool.query(`SELECT 
  shipment.packingno, 
  shipment.slctcateg, 
  shipment.slctsubcateg, 
  shipment.slctmat, 
  shipment.slcttype, 
  shipment.quantity, 
  shipment.receivedqty,
  shipment.remainingqty, 
  material_category.name AS categoryname,
  material.component AS materialname,
  material.description AS materialdescription,
  material.activeButtonText AS materialunit,
  subcategory.name AS subcategoryname, 
  material_types.name AS typename,
  (SELECT COUNT(*) FROM serial_numbers WHERE shipid = '${shpid}') AS total_sn
 FROM shipment 
 JOIN material_category ON shipment.slctcateg = material_category.id 
 JOIN material ON shipment.slctmat = material.id 
 JOIN subcategory ON shipment.slctsubcateg = subcategory.id 
 JOIN material_types ON shipment.slcttype = material_types.id   
 WHERE shipment.shipid = '${shpid}'`, (error, results, fields) => {
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
    const selectQuery = 'SELECT * FROM manufacture ORDER BY id DESC';
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
    const selectQuery = 'SELECT * FROM warehouse ORDER BY id DESC';
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
app.post('/get-siteaddressbyId', upload.none(),  (request, response) => {
	const siteid = request.body.siteid;
	pool.query(`SELECT sitelocation FROM site WHERE id = '${siteid}'`, (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Site not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Site not found in database' });
		}
		return response.json({ data: results });
	});
});
app.get('/get-site', (request, response) => {
    const selectQuery = 'SELECT * FROM site ORDER BY id DESC';
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
    const selectQuery = 'SELECT * FROM company ORDER BY id DESC';
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
    const selectQuery = 'SELECT * FROM users ORDER BY id DESC';
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
app.post('/add-role', upload.none(),  (request, response) => {
	const username = request.body.username;
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
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO user_role (username, add_material, mcategory, msn, manufacture, shipment, warehouse, site, company, sitereq, createreq, requpdate, userinfo, rolecontrol, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, add_material, mcategory, msn, manufacture, shipment, warehouse, site, company, sitereq, createreq, requpdate, userinfo, rolecontrol, created_at, created_at],(error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Role not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Role not created in database' });
		}
		return response.json({ message: 'Response: Role created successfully!'});
	});
});
app.post('/add-sn', upload.none(),  (request, response) => {
	const shpsnmnly = request.body.shpsnmnly;
	const slctshipment = request.body.slctshipment;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO serial_numbers (serial, matid, created_at, updated_at) VALUES (?, ?, ?, ?)', [shpsnmnly, slctshipment, created_at, created_at], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Serial Number not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Serial Number not updated in database' });
		}
		return response.json({ message: 'Response: Serial Number updated successfully!'});
	});
});
app.post('/add-sn-bulk', upload.none(),  (request, response) => {
	const shpsnmnly = request.body.shpsnmnly;
	const slctshipment = request.body.slctshipment;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('SELECT id FROM material WHERE component = ?', [slctshipment], (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return response.status(404).json({ error: 'Material not found' });
        }

        const materialId = results[0].id;
        // Insert the serial number with the retrieved material id
        pool.query('INSERT INTO serial_numbers (serial, matid, created_at, updated_at) VALUES (?, ?, ?, ?)', [shpsnmnly, materialId, created_at, created_at], (insertError, insertResults, insertFields) => {
            if (insertError) {
                return response.status(500).json({ error: 'Error inserting serial number' });
            }

            return response.json({ message: 'Serial Number added successfully' });
        });
    });
});
app.post('/get-sn', upload.none(),  (request, response) => {
    const shipId = request.body.slctshipment; // Correct the variable name to match the one used in the query
    pool.query(`SELECT 
	serial_numbers.id,
	serial_numbers.serial,
	material.component AS materialname
   FROM serial_numbers 
   JOIN material ON serial_numbers.matid = material.id 
   WHERE serial_numbers.matid = '${shipId}'`, (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return response.status(404).json({ error: 'Serial Number not found in database' });
        }
        return response.json({ message: 'Response: Serial Number found successfully!', data: results });
    });
});
app.post('/get-allsnbyMat', upload.none(), (request, response) => {
    const topid = request.body.topid;
    pool.query('SELECT matid FROM requisition_lisiting WHERE rmnm = ?', [topid], (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return response.status(404).json({ error: 'Serial Number not found in database' });
        }

        const matids = results.map(row => row.matid);
        pool.query('SELECT * FROM serial_numbers WHERE matid IN (?)', [matids], (snError, snResults, snFields) => {
            if (snError) {
                return response.status(500).json({ error: 'Error fetching serial numbers' });
            }

            return response.json({ message: 'Response: Serial Numbers found successfully!', data: snResults });
        });
    });
});
app.post('/request-requisition', upload.none(),  (request, response) => {
	const rmnm = request.body.rmnm;
	const mruser = request.body.mruser;
	const slctsite = request.body.slctsite;
	const outdate = request.body.outdate;
	const ppperson = request.body.ppperson;
	const ppnumber = request.body.ppnumber;
	const slctcomp = request.body.slctcomp;
	const trpmode = request.body.trpmode;
	const trpnumber = request.body.trpnumber;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO requistion_request (rm_number, created_by, siteid, outbound, ppperson, ppnumber, companyid, trsmode, trsnumber,  created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [rmnm, mruser, slctsite, outdate, ppperson, ppnumber, slctcomp, trpmode, trpnumber, created_at, created_at], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Requisition not created in database' });
		}
		return response.json({ message: 'Response: Requisition created successfully!'});
	});
});
app.post('/get-shipmentvaluesbyWH', upload.none(),  (request, response) => {
    const shpid = request.body.shpid; // Correct the variable name to match the one used in the query
    pool.query(`SELECT 
	shipment.packingno, 
	shipment.slctcateg, 
	shipment.slctsubcateg, 
	shipment.slctmat, 
	shipment.slcttype, 
	shipment.quantity, 
	shipment.receivedqty,
	shipment.remainingqty, 
	material_category.name AS categoryname,
	material.component AS materialname,
	material.description AS materialdescription,
	material.activeButtonText AS materialunit,
	subcategory.name AS subcategoryname, 
	material_types.name AS typename,
	(SELECT COUNT(*) FROM serial_numbers WHERE shipid = '${shpid}') AS total_sn
   FROM shipment 
   JOIN material_category ON shipment.slctcateg = material_category.id 
   JOIN material ON shipment.slctmat = material.id 
   JOIN subcategory ON shipment.slctsubcateg = subcategory.id 
   JOIN material_types ON shipment.slcttype = material_types.id   
   WHERE shipment.slctwrhs = '${shpid}'`, (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return response.status(404).json({ error: 'Shipment not found in database' });
        }
        return response.json({ message: 'Response: Shipment found successfully!', data: results });
    });
});
app.post('/add-requisitionlisiting', upload.none(),  (request, response) => {
	const rmnm = request.body.rmnm;
	const slctwrhs = request.body.slctwrhs;
	const packingno = request.body.packingno;
	const shpcat = request.body.shpcat;
	const slctshpsubcat = request.body.slctshpsubcat;
	const shptype = request.body.shptype;
	const shpmatname = request.body.shpmatname;
	const shppurchase = request.body.shppurchase;
	const shpreceived = request.body.shpreceived;
	const shpremaining = request.body.shpremaining;
	const shounit = request.body.shounit;
	const shpupdatedqty = request.body.shpupdatedqty;
	const shpremainingqty = request.body.shpremainingqty;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO requisition_lisiting (rmnm, whid, packingno, categid, subcategid, typeid, matid, quantity, receivedqty, remainingqty, unit, addqty, rmqty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [rmnm, slctwrhs, packingno, shpcat, slctshpsubcat, shptype, shpmatname, shppurchase, shpreceived, shpremaining, shounit, shpupdatedqty, shpremainingqty, created_at, created_at], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		// if(results.length === 0){
		// 	return response.status(500).json({ error: 'Requisition Listing not created in database' });
		// }
		// return response.json({ message: 'Response: Requisition Listing created successfully!', data: results});
		pool.query('SELECT * FROM requisition_lisiting WHERE id = ?', results.insertId, (selectError, selectResults, selectFields) => {
            if (selectError) {
                return response.status(500).json({ error: 'Error fetching inserted row' });
            }

            // Check if any rows were returned
            if (selectResults.length === 0) {
                return response.status(500).json({ error: 'Inserted row not found' });
            }

            // Return the inserted row's data
            return response.json({ message: 'Response: Requisition Listing created successfully!', data: selectResults[0] });
        });
	});
});
app.post('/get-reqbyId', upload.none(),  (request, response) => {
	const shpid = request.body.shpid;
	pool.query(`SELECT 
	requisition_lisiting.id,
	requisition_lisiting.packingno,
	requisition_lisiting.addsl,
	requisition_lisiting.unit,
	material.component AS materialname,
	material_types.name AS typename,
	material.description AS materialdesc,
	requisition_lisiting.addqty
   FROM requisition_lisiting 
   JOIN material ON requisition_lisiting.matid = material.id 
   JOIN material_types ON requisition_lisiting.typeid = material_types.id
   WHERE requisition_lisiting.id = '${shpid}'`, (error, results, fields) => {
		if (error) {
		return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Requisition not found in database' });
		}
		return response.json({ data: results });
	});
});
app.post('/get-reqbyRNMN', upload.none(),  (request, response) => {
	const shpid = request.body.shpid;
	pool.query(`SELECT 
	requisition_lisiting.id,
	requisition_lisiting.packingno,
	requisition_lisiting.addsl,
	requisition_lisiting.unit,
	material.component AS materialname,
	material_types.name AS typename,
	material.description AS materialdesc,
	requisition_lisiting.addqty,
	requistion_request.outbound,
	requistion_request.ppperson,
	requistion_request.ppnumber,
	requistion_request.trsmode,
	requistion_request.trsnumber,
	site.sitename,
	site.sitelocation,
	company.compname
   FROM requisition_lisiting 
   JOIN material ON requisition_lisiting.matid = material.id 
   JOIN requistion_request ON requisition_lisiting.rmnm = requistion_request.rm_number 
   JOIN material_types ON requisition_lisiting.typeid = material_types.id
   JOIN site ON requistion_request.siteid = site.id
   JOIN company ON requistion_request.companyid = company.id
   WHERE requisition_lisiting.rmnm = '${shpid}'`, (error, results, fields) => {
		if (error) {
			console.log(error);
		return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'Requisition not found in database' });
		}
		return response.json({ data: results });
	});
});
app.post('/update-lisitingsn', upload.none(),  (request, response) => {
	const lsid = request.body.lsid;
	const selectedCheckboxes = request.body.selectedCheckboxes;
	const stringWithSpaces = selectedCheckboxes.replace(/,/g, ' ');
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('UPDATE requisition_lisiting SET addsl = ?, updated_at = ? WHERE id = ?', [stringWithSpaces, updated_at, lsid], (error, results, fields) => {
		if (error) {
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		// if(results.length === 0){
		// 	return response.status(500).json({ error: 'Requisition not updated in database' });
		// }
		// return response.json({ message: 'Response: Requisition updated successfully!'});
		pool.query('SELECT * FROM requisition_lisiting WHERE id = ?', [lsid], (selectError, selectResults, selectFields) => {
            if (selectError) {
                return response.status(500).json({ error: 'Error fetching inserted row' });
            }
            if (selectResults.length === 0) {
                return response.status(500).json({ error: 'Inserted row not found' });
            }
            return response.json({ message: 'Response: Requisition Listing updated successfully!', data: selectResults[0] });
        });
	});
});
app.post('/check-usercontrol', upload.none(),  (request, response) => {
    const rmnm = request.body.rmnm; // Correct the variable name to match the one used in the query
    pool.query('SELECT * FROM user_requisition WHERE rmnm = ?', [rmnm], (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return response.status(404).json({ error: 'User not found in database' });
        }
        return response.json({ data: results });
    });
});
app.post('/add-userreq', upload.none(),  (request, response) => {
	const rmnm = request.body.rmnm;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('INSERT INTO user_requisition (rmnm, created_at, updated_at) VALUES (?, ?, ?)', [rmnm, created_at, created_at], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.post('/update-userreq', upload.none(),  (request, response) => {
	const email = request.body.email;
	const rmnm = request.body.rmnm;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query(`SELECT fullname, mobile, email FROM users Where email = ?`, [email], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		const fullname = results[0].fullname;
		const address = results[0].mobile;
		const email = results[0].email;
		const concatenatedString = fullname + '<br> ' + email + '<br> ' + address;
		pool.query('UPDATE user_requisition SET mrcreatedby = ?, updated_at = ? WHERE rmnm = ?', [concatenatedString, updated_at, rmnm], (updateError, updateResults, updateFields) => {
            if (updateError) {
                return response.status(500).json({ error: 'Error updating user requisition' });
            }
            return response.json({ message: 'Response: User Requisition updated successfully!', user: results[0] });
        });
		// return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.post('/update-SNuserreq', upload.none(),  (request, response) => {
	const email = request.body.email;
	const rmnm = request.body.rmnm;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query(`SELECT fullname, mobile, email FROM users Where email = ?`, [email], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		const fullname = results[0].fullname;
		const address = results[0].mobile;
		const email = results[0].email;
		const concatenatedString = fullname + '<br> ' + email + '<br> ' + address;
		pool.query('UPDATE user_requisition SET sncreatedby	 = ?, updated_at = ? WHERE rmnm = ?', [concatenatedString, updated_at, rmnm], (updateError, updateResults, updateFields) => {
            if (updateError) {
                return response.status(500).json({ error: 'Error updating user requisition' });
            }
            return response.json({ message: 'Response: User Requisition updated successfully!', user: results[0] });
        });
		// return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.post('/update-Chuserreq', upload.none(),  (request, response) => {
	const email = request.body.email;
	const rmnm = request.body.rmnm;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query(`SELECT fullname, mobile, email FROM users Where email = ?`, [email], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		const fullname = results[0].fullname;
		const address = results[0].mobile;
		const email = results[0].email;
		const concatenatedString = fullname + '<br> ' + email + '<br> ' + address;
		pool.query('UPDATE user_requisition SET checkedby	 = ?, updated_at = ? WHERE rmnm = ?', [concatenatedString, updated_at, rmnm], (updateError, updateResults, updateFields) => {
            if (updateError) {
                return response.status(500).json({ error: 'Error updating user requisition' });
            }
            return response.json({ message: 'Response: User Requisition updated successfully!', user: results[0] });
        });
		// return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.post('/update-Accuserreq', upload.none(),  (request, response) => {
	const email = request.body.email;
	const rmnm = request.body.rmnm;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query(`SELECT fullname, mobile, email FROM users Where email = ?`, [email], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		const fullname = results[0].fullname;
		const address = results[0].mobile;
		const email = results[0].email;
		const concatenatedString = fullname + '<br> ' + email + '<br> ' + address;
		pool.query('UPDATE user_requisition SET acceptedby	 = ?, updated_at = ? WHERE rmnm = ?', [concatenatedString, updated_at, rmnm], (updateError, updateResults, updateFields) => {
            if (updateError) {
                return response.status(500).json({ error: 'Error updating user requisition' });
            }
            return response.json({ message: 'Response: User Requisition updated successfully!', user: results[0] });
        });
		// return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.post('/update-Rvwuserreq', upload.none(),  (request, response) => {
	const email = request.body.email;
	const rmnm = request.body.rmnm;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query(`SELECT fullname, mobile, email FROM users Where email = ?`, [email], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		const fullname = results[0].fullname;
		const address = results[0].mobile;
		const email = results[0].email;
		const concatenatedString = fullname + '<br> ' + email + '<br> ' + address;
		pool.query('UPDATE user_requisition SET reviewby	 = ?, updated_at = ? WHERE rmnm = ?', [concatenatedString, updated_at, rmnm], (updateError, updateResults, updateFields) => {
            if (updateError) {
                return response.status(500).json({ error: 'Error updating user requisition' });
            }
            return response.json({ message: 'Response: User Requisition updated successfully!', user: results[0] });
        });
		// return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.post('/update-Appruserreq', upload.none(),  (request, response) => {
	const email = request.body.email;
	const rmnm = request.body.rmnm;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query(`SELECT fullname, mobile, email FROM users Where email = ?`, [email], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		const fullname = results[0].fullname;
		const address = results[0].mobile;
		const email = results[0].email;
		const concatenatedString = fullname + '<br> ' + email + '<br> ' + address;
		pool.query('UPDATE user_requisition SET approvedby	 = ?, updated_at = ? WHERE rmnm = ?', [concatenatedString, updated_at, rmnm], (updateError, updateResults, updateFields) => {
            if (updateError) {
                return response.status(500).json({ error: 'Error updating user requisition' });
            }
            return response.json({ message: 'Response: User Requisition updated successfully!', user: results[0] });
        });
		// return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.get('/get-allreqs', upload.none(), (request, response) => {
    pool.query(`SELECT 
                    rr.id,
                    rr.rm_number,
                    rr.created_by,
                    rr.outbound,
                    rr.created_at,
                    site.sitename AS sitename,
                    company.compname AS compname,
                    ur.mrcreatedby,
                    ur.sncreatedby,
                    ur.checkedby,
                    ur.acceptedby,
                    ur.reviewby,
                    ur.approvedby,
                    ur.rejected_by
                FROM requistion_request AS rr
                JOIN company ON rr.companyid = company.id 
                JOIN site ON rr.siteid = site.id
                LEFT JOIN user_requisition AS ur ON rr.rm_number = ur.rmnm
				ORDER BY rr.id DESC`, (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return response.status(404).json({ error: 'Requistion requests not found in database' });
        }

        // Iterate over the results to determine the status for each row
        const formattedResults = results.map(row => {
			if (row.rejected_by !== null) {
                row.status = `Rejected By ${row.rejected_by}`;
            } else if (row.approvedby !== null) {
                row.status = 'Waiting For Delivery';
            } else if (row.reviewby !== null) {
                row.status = 'Waiting for Approval';
            } else if (row.acceptedby !== null) {
                row.status = 'Waiting For Review';
            } else if (row.checkedby !== null) {
                row.status = 'Waiting for Accepted';
            } else if (row.sncreatedby !== null) {
                row.status = 'Waiting for checking';
            } else if (row.mrcreatedby !== null) {
                row.status = 'Waiting For S/N';
            } else {
                row.status = 'Unknown status';
            }
            return row;
        });

        return response.json({ message: 'Response: Requistion requests found successfully!', data: formattedResults });
    });
});
app.post('/check-userauth', upload.none(),  (request, response) => {
    const email = request.body.email; // Correct the variable name to match the one used in the query
    pool.query(`SELECT username FROM users Where email = ?`, [email], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		const username = results[0].username;
		pool.query('SELECT * FROM user_role WHERE username = ?', [username], (updateError, updateResults, updateFields) => {
            if (updateError) {
                return response.status(500).json({ error: 'Error updating user requisition' });
            }
            return response.json({ message: 'Response: User Requisition updated successfully!', data: updateResults[0] });
        });
		// return response.json({ message: 'Response: User Requisition created successfully!'});
	});
});
app.post('/reject-req', upload.none(),  (request, response) => {
	const email = request.body.email;
	const rmnm = request.body.rmnm;
	const rejectnote = request.body.rejectnote;
	const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	pool.query('UPDATE user_requisition SET reject_note	 = ?, rejected_by	 = ?, updated_at = ? WHERE rmnm = ?', [rejectnote, email, updated_at, rmnm], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		return response.json({ message: 'Response: User Requisition updated successfully!' });
	});
});
app.get('/req-dashboard', (request, response) => {
    // Query to count total number of rows
    pool.query(`SELECT COUNT(*) AS totalRows FROM user_requisition`, (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }

        // Extract the total number of rows from the results
        const totalRows = results[0].totalRows;

        // Query to count number of rows where approved_by is not null
        pool.query(`SELECT COUNT(*) AS approvedRows FROM user_requisition WHERE approvedby IS NOT NULL`, (approvedError, approvedResults, approvedFields) => {
            if (approvedError) {
                return response.status(500).json({ error: 'Internal Server Error' });
            }

            // Extract the count of rows where approved_by is not null
            const approvedRows = approvedResults[0].approvedRows;

            // Query to count number of rows where approved_by is null
            pool.query(`SELECT COUNT(*) AS notApprovedRows FROM user_requisition WHERE approvedby IS NULL`, (notApprovedError, notApprovedResults, notApprovedFields) => {
                if (notApprovedError) {
                    return response.status(500).json({ error: 'Internal Server Error' });
                }

                // Extract the count of rows where approved_by is null
                const notApprovedRows = notApprovedResults[0].notApprovedRows;
				pool.query(`SELECT COUNT(*) AS completed FROM user_requisition WHERE completed IS NOT NULL`, (CompletedError, CompletedResults, CompletedFields) => {
					if (CompletedError) {
						return response.status(500).json({ error: 'Internal Server Error' });
					}
					const completedRows = CompletedResults[0].completed;
					pool.query(`SELECT COUNT(*) AS attach_file FROM user_requisition WHERE attach_file IS NOT NULL`, (AttachFileError, AttachfileResults, AttachFields) => {
						if (AttachFileError) {
							return response.status(500).json({ error: 'Internal Server Error' });
						}
						const attachRows = AttachfileResults[0].attach_file;
		
						pool.query(`SELECT COUNT(*) AS install_status FROM user_requisition WHERE install_status IS NOT NULL`, (InstallError, InstallResults, AttachFields) => {
							if (InstallError) {
								return response.status(500).json({ error: 'Internal Server Error' });
							}
							const installRows = InstallResults[0].install_status;
			
							// Return the total number of rows and counts of approved and not approved rows in the response
							return response.json({ totalRows: totalRows, approvedRows: approvedRows, notApprovedRows: notApprovedRows, completedRows: completedRows, attachRows: attachRows, installRows: installRows });
						});
					});
				});
                // Return the total number of rows and counts of approved and not approved rows in the response
                // return response.json({ totalRows: totalRows, approvedRows: approvedRows, notApprovedRows: notApprovedRows });
            });
        });
    });
});
app.post('/getpuchaseqty', upload.none(),  (request, response) => {
    const selectedValue = request.body.selectedValue;
    pool.query('SELECT SUM(quantity) AS totalQuantity FROM material WHERE slctsubcateg = ? GROUP BY slctsubcateg', [selectedValue], (error, results, fields) => {
        if (error) {
            return response.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return response.status(404).json({ error: 'No quantity found for the selected subcategory' });
        }
        return response.json({ data: results[0].totalQuantity });
    });
});

app.post('/getwarehouseqty', upload.none(),  (request, response) => {
	const selectedValue = request.body.selectedValue;
	pool.query('SELECT SUM(receivedqty) AS recievedQuantity FROM shipment WHERE slctsubcateg = ? GROUP BY slctsubcateg', [selectedValue], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		return response.json({ data: results[0].recievedQuantity});
	});
});
app.post('/getsiteqty', upload.none(),  (request, response) => {
	const selectedValue = request.body.selectedValue;
	pool.query('SELECT addqty FROM requisition_lisiting WHERE subcategid = ?', [selectedValue], (error, results, fields) => {
		if (error) {
			// console.error('Error executing SQL query:', error);
		  return response.status(500).json({ error: 'Requisition not found' });
		}
		if(results.length === 0){
			return response.status(500).json({ error: 'User Requisition not created in database' });
		}
		return response.json({ data: results});
	});
});