require('dotenv').config();

console.log('DB_USER:', process.env.DB_USER, typeof process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);
console.log('DB_PORT:', process.env.DB_PORT, typeof process.env.DB_PORT);
console.log('DB_HOST:', process.env.DB_HOST, typeof process.env.DB_HOST); // Add this too for complete check
console.log('DB_NAME:', process.env.DB_NAME, typeof process.env.DB_NAME); // Add this too for complete check
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('EMAIL_USER present:', !!process.env.EMAIL_USER);
console.log('FRONTEND_URL present:', !!process.env.FRONTEND_URL); // Check FRONTEND_URL too

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // The server explicitly states it does not support SSL connections.
    // Setting ssl to false tells the pg client to connect without SSL.
    ssl: false
});

// --- ADD ERROR HANDLING FOR PG POOL ---
pool.on('error', (err, client) => {
    console.error('🔥 Unexpected error on idle PostgreSQL client', err);
    // process.exit(-1); // Consider exiting the process if a client has an unrecoverable error
});

// Optional: Test database connection on startup
pool.connect()
    .then(client => {
        console.log('🚀 Successfully connected to PostgreSQL database!');
        client.release(); // Release the client back to the pool
    })
    .catch(err => {
        console.error('❌ Failed to connect to PostgreSQL database:', err.message);
        console.error('Please check your DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in the .env file.');
        console.error('Also ensure your PostgreSQL server is running and accessible.');
        process.exit(1); // Exit the process if we can't connect to the DB on startup
    });
// --- END DB ERROR HANDLING ---


// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // This addresses the "self-signed certificate in certificate chain" error
    // when Nodemailer tries to connect to the SMTP server.
    // WARNING: Setting rejectUnauthorized to false disables SSL certificate validation.
    // This is UNSAFE for production environments. Use ONLY for local development
    // or if you explicitly understand the security implications.
    tls: {
        rejectUnauthorized: false
    }
});

// Multer config – Excel upload
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            return cb(new Error('Only .xlsx files are allowed'));
        }
        cb(null, true);
    },
});

// Multer config – Image upload for product update
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this directory exists! Create it manually if it doesn't: uploads/images/
        const dir = 'uploads/images/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + originalExtension);
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
            return cb(new Error('Only JPG, PNG, GIF images are allowed'));
        }
        cb(null, true);
    },
});

// Token verification middleware for Admins
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token format is "Bearer <token>".' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Admin Token verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.adminId = decoded.adminId;
        next();
    });
}

// Admin registration (run once or protect in production)
app.post('/api/admin/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const existingAdmin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (existingAdmin.rows.length > 0) {
            return res.status(409).json({ message: 'Email is already registered. Please use a different email or log in.' });
        }

        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO admins (email, password) VALUES ($1, $2)',
            [email, hashed]
        );

        res.json({ success: true, message: 'Admin registered successfully.' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        const admin = result.rows[0];
        if (!admin) return res.status(403).send('Invalid credentials');

        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) return res.status(403).send('Invalid credentials');

        const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.send({ success: true, token });
    } catch (err) {
        res.status(500).send('Login failed');
    }
});

// Upload route with API key + token middleware for Excel files
app.post(
    '/api/upload',
    verifyToken,
    (req, res, next) => {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== process.env.ADMIN_API_KEY) {
            return res.status(403).send('Unauthorized');
        }
        next();
    },
    upload.single('file'),
    async (req, res) => {
        const filePath = req.file.path;

        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            for (const item of data) {
                const { sku, name, description, price, stock: stock, category } = item; // Added category

                const parsedPrice = parseFloat(price);
                const parsedStock = parseInt(stock, 10);

                if (isNaN(parsedPrice) || isNaN(parsedStock)) {
                    console.warn(`Skipping row due to invalid price or stock: SKU ${sku}`);
                    continue;
                }

                await pool.query(
                    `INSERT INTO products (sku, name, description, price, stock, category, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    ON CONFLICT (sku)
                    DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        price = EXCLUDED.price,
                        stock = EXCLUDED.stock,
                        category = EXCLUDED.category,
                        updated_at = NOW()`,
                    [sku, name, description, parsedPrice, parsedStock, category || 'Uncategorized'] // Default category
                );
            }

            fs.unlinkSync(filePath);
            res.json({ message: 'Excel file processed successfully.' });
        } catch (err) {
            console.error('Error processing Excel:', err);
            if (err.message.includes("column \"stock\"") || err.message.includes("column \"category\"")) {
                res.status(400).json({ error: "Excel column 'stock' or 'category' must map correctly, or database query mismatch." });
            } else {
                res.status(500).json({ error: 'Failed to process Excel file.' });
            }
        }
    }
);

// Get all products (MODIFIED to include category)
app.get('/api/products', async (req, res) => {
    try {
        // Ensure 'category' column is selected here
        const result = await pool.query("SELECT id, sku, name, description, price, stock, category, updated_at, array_to_json(images) as images FROM products ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get single product by id
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Customer registration
app.post('/api/customer/register', async (req, res) => {
    const { username, email, password, first_name, last_name, phone_number, address } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        const existingUser = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Username or email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.query(
            `INSERT INTO customers (
                username, email, password, first_name, last_name, phone_number, address,
                is_active, activation_token, activation_token_expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                username, email, hashedPassword, first_name, last_name, phone_number, address,
                false, activationToken, activationTokenExpiresAt
            ]
        );

        const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173/'}/activate?token=${activationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Account Activation for Altitude Technologies',
            html: `
                <p>Hello ${username},</p>
                <p>Thank you for registering with Altitude Technologies! Please click on the link below to activate your account:</p>
                <p><a href="${activationUrl}">Activate My Account</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not register for an account, please ignore this email.</p>
                <p>Best regards,<br/>Altitude Technologies Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to activate your account.'
        });

    } catch (err) {
        console.error('Customer registration error:', err); // Always log the full error for debugging

        // Check for specific PostgreSQL unique constraint violations (e.g., if any other unique constraint were added)
        if (err.code === '23505') { // PostgreSQL unique violation error code
            // This case specifically handles if, for some reason, a UNIQUE constraint on email
            // (e.g., 'customers_email_key') gets violated during the INSERT
            // This is a robust fallback even if the initial `existingUser` check misses something.
            if (err.constraint === 'customers_email_key') { // Make sure 'customers_email_key' is the correct constraint name
                return res.status(409).json({ message: 'Email is already registered. Please use a different email or log in.' });
            }
            // Add more specific checks if you have other unique constraints on 'customers' table
            // else if (err.constraint === 'some_other_unique_constraint_name') {
            //     return res.status(409).json({ message: 'Another unique field is duplicated.' });
            // }
        }
        // Handle common Nodemailer/email sending errors
        else if (err.code === 'EAUTH') {
            // This is the "Invalid login: Application-specific password required" error
            return res.status(500).json({ message: 'Registration failed: Server could not authenticate with email service. Please ensure EMAIL_USER and EMAIL_PASS are correct (App Password if 2FA is on).' });
        }
        else if (err.code === 'ESOCKET') {
            // This is the "self-signed certificate" or other connection issue error
            return res.status(500).json({ message: 'Registration failed: Server could not connect to email service. Check network or security software.' });
        }
        // Generic error for anything else unexpected
        else {
            return res.status(500).json({ message: 'An unexpected server error occurred during registration. Please try again later.' });
        }
    }
});

// Account Activation Endpoint
app.post('/api/customer/activate-account', async (req, res) => {
    const { token } = req.body;

    console.log('Backend: Token received from frontend:', token);


    if (!token) {
        return res.status(400).json({ error: 'Activation token is missing.' });
    }

    try {
        const result = await pool.query(
            `SELECT id, is_active, activation_token_expires_at
             FROM customers
             WHERE activation_token = $1`,
            [token]
        );
        const customer = result.rows[0];

        if (!customer) {
            return res.status(404).json({ error: 'Invalid activation token.' });
        }

        if (customer.is_active) {
            return res.status(400).json({ message: 'Account is already active.' });
        }

        if (new Date() > customer.activation_token_expires_at) {
            return res.status(400).json({ error: 'Activation token has expired. Please register again.' });
        }

        await pool.query(
            `UPDATE customers
             SET is_active = TRUE, activation_token = NULL, activation_token_expires_at = NULL, updated_at = NOW()
             WHERE id = $1`,
            [customer.id]
        );

        res.json({ message: 'Account activated successfully! You can now log in.' });

    } catch (err) {
        console.error('Account activation error:', err);
        res.status(500).json({ error: 'Internal server error during activation.' });
    }
});

// Customer login
app.post('/api/customer/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM customers WHERE email = $1 OR username = $2', [email, email]);
        const customer = result.rows[0];

        if (!customer) {
            return res.status(403).json({ message: 'Invalid credentials.' });
        }

        if (!customer.is_active) {
            return res.status(403).json({ message: 'Account not activated. Please check your email for the activation link.' });
        }

        const validPassword = await bcrypt.compare(password, customer.password);
        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { customerId: customer.id, email: customer.email, username: customer.username },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );
        res.send({
            success: true,
            token,
            customerId: customer.id,
            email: customer.email,
            username: customer.username
        });
    } catch (err) {
        console.error('Customer login error:', err);
        res.status(500).json({ message: 'Login failed due to server error.' });
    }
});

// Middleware to verify customer token
function verifyCustomerToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token format is "Bearer <token>".' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Customer Token verification error:', err);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired. Please log in again.' });
            }
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.customerId = decoded.customerId;
        req.customerEmail = decoded.email;
        req.customerUsername = decoded.username;
        next();
    });
}

// Place a new order
app.post('/api/orders', verifyCustomerToken, async (req, res) => {
    const { items, totalAmount, shippingAddress } = req.body;
    const customerId = req.customerId;

    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
        return res.status(400).json({ message: 'Invalid order data. Items and totalAmount are required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const item of items) {
            const productCheck = await client.query('SELECT stock FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
            if (productCheck.rows.length === 0) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }
            const currentStock = productCheck.rows[0].stock;
            if (currentStock < item.stock) {
                throw new Error(`Insufficient stock for product ${item.productId}. Available: ${currentStock}, Requested: ${item.stock}`);
            }
        }

        const orderResult = await client.query(
            'INSERT INTO orders (customer_id, total_amount, shipping_address, items) VALUES ($1, $2, $3, $4::jsonb) RETURNING id, order_date',
            [customerId, totalAmount, shippingAddress, JSON.stringify(items)]
        );
        const orderId = orderResult.rows[0].id;

        for (const item of items) {
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.stock, item.productId]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, message: 'Order placed successfully!', orderId: orderId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error placing order:', err);
        if (err.message.includes("Insufficient stock")) {
            return res.status(400).json({ message: err.message });
        }
        if (err.message.includes("Product with ID")) {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: 'Failed to place order. Please try again.' });
    } finally {
        client.release();
    }
});

// Admin API: Get orders by status
app.get('/api/admin/orders/:status', verifyToken, async (req, res) => {
    const { status } = req.params; // 'pending' or 'completed'

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid order status. Must be "pending" or "completed".' });
    }

    try {
        const result = await pool.query('SELECT * FROM orders WHERE status = $1 ORDER BY order_date DESC', [status]);
        res.json(result.rows);
    } catch (err) {
        console.error(`Error fetching ${status} orders for admin:`, err);
        res.status(500).json({ message: 'Failed to retrieve orders.' });
    }
});

// Admin API: Mark order as completed
app.put('/api/admin/orders/:id/complete', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            ['completed', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json({ success: true, message: `Order ${id} marked as completed.`, order: result.rows[0] });
    } catch (err) {
        console.error('Error marking order as completed:', err);
        res.status(500).json({ message: 'Failed to mark order as completed.' });
    }
});


// Past orders endpoint (for customers)
app.get('/api/customer/orders', verifyCustomerToken, async (req, res) => {
    const customerId = req.customerId;

    try {
        const result = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC', [customerId]);
        res.json(result.rows);
    }  catch (err) {
        console.error('Error fetching customer orders:', err);
        res.status(500).json({ message: 'Failed to retrieve orders.' });
    }
});

// Consolidated and Updated PUT route for product update
app.put(
    '/api/products/:id',
    verifyToken,
    imageUpload.single('image'),
    async (req, res) => {
        try {
            const productId = req.params.id;
            const { price, stock } = req.body;
            const file = req.file; // This is the newly uploaded file object

            // Log the received file for debugging
            console.log('PUT /api/products/:id - Received file:', file);

            // Fetch current product to get old image path before update
            const productResult = await pool.query('SELECT images FROM products WHERE id = $1', [productId]);
            if (productResult.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            const currentImages = productResult.rows[0].images; // Get current images from DB

            const updates = [];
            const values = [];
            let idx = 1;

            if (price !== undefined) {
                updates.push(`price = $${idx++}`);
                values.push(parseFloat(price));
            }

            if (stock !== undefined) {
                updates.push(`stock = $${idx++}`);
                values.push(parseInt(stock, 10));
            }

            // If a new image file is provided, replace the existing 'images' array
            if (file) {
                const imagePath = `/uploads/images/${file.filename}`;
                console.log('PUT /api/products/:id - New image path:', imagePath);

                // --- START: NEW IMAGE DELETION LOGIC ---
                // If there was an old image, delete it from the file system
                if (currentImages && currentImages.length > 0) {
                    // Assuming images are stored as /uploads/images/filename.png
                    const oldImageRelativePath = currentImages[0];
                    const oldImageFullPath = path.join(__dirname, 'public', oldImageRelativePath);
                    console.log('Attempting to delete old image:', oldImageFullPath);
                    try {
                        // Check if the file exists before attempting to delete
                        if (fs.existsSync(oldImageFullPath)) {
                            fs.unlinkSync(oldImageFullPath);
                            console.log('Old image deleted successfully:', oldImageFullPath);
                        } else {
                            console.log('Old image file not found on disk, skipping deletion:', oldImageFullPath);
                        }
                    } catch (deleteErr) {
                        console.error('Error deleting old image file:', deleteErr);
                        // Continue even if deletion fails, as the new image is the priority
                    }
                }
                // --- END: NEW IMAGE DELETION LOGIC ---

                updates.push(`images = ARRAY[$${idx++}]`); // Set images to a new array with only the new path
                values.push(imagePath);
            }

            if (updates.length === 0) {
                console.log('PUT /api/products/:id - No updates requested.');
                return res.status(400).json({ error: 'No changes to update' });
            }

            values.push(productId);

            const query = `
                UPDATE products
                SET ${updates.join(', ')}, updated_at = NOW()
                WHERE id = $${idx}
                RETURNING *;
            `;

            console.log('PUT /api/products/:id - SQL Query:', query);
            console.log('PUT /api/products/:id - Query Values:', values);

            const updateResult = await pool.query(query, values);
            console.log('PUT /api/products/:id - Update result rows:', updateResult.rows);

            res.json({ success: true, product: updateResult.rows[0] });
        } catch (err) {
            console.error('Error updating product:', err);
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            }
            res.status(500).json({ error: 'Failed to update product' });
        }
    }
);


// Handle purchase request and send email
app.post('/api/purchase', async (req, res) => {
    const { sku, stock, email } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `Purchase Request: ${sku}`,
        text: `Client wants to buy:\nSKU: ${sku}\nStock: ${stock}\nClient Email: ${email}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Request sent! We will get back to you shortly.' });
    } catch (err) {
        console.error('Error sending email for purchase request:', err);
        res.status(500).json({ success: false, error: 'Email failed to send. Please try again later.' });
    }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

// --- GLOBAL UNCAUGHT EXCEPTION/UNHANDLED REJECTION HANDLERS ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, cleanup, or exit
    // process.exit(1); // Consider exiting for serious unhandled rejections
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    // Application specific logging, cleanup, or exit
    // process.exit(1); // Consider exiting for serious uncaught exceptions
});
