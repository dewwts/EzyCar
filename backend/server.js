const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// 🛡️ Use sanitize function directly (not as middleware that overwrites req.query)
const { sanitize } = require('express-mongo-sanitize');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Routes files
const providers = require('./routes/providers');
const auth = require('./routes/auth');
const bookings = require('./routes/booking');

const app = express();

// Body parser & cookies
app.use(express.json());
app.use(cookieParser());

// Security middlewares
app.use(helmet());
app.use(xss());

app.use((req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    //if (req.headers) req.headers = sanitize(req.headers);
    next();
});

// Enable CORS
app.use(cors());

// Prevent HTTP param pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
});
app.use(limiter);

// Swagger options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'EZyCar API',
            version: '1.0.0',
            description: 'Car service booking platform API',
        },
        servers: [
            { url: 'http://localhost:5003/api/v1' },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Routes
app.use('/api/v1/providers', providers);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

const PORT = process.env.PORT || 5003;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
