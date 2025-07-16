import express from 'express';;
import cors from 'cors';

const app = express();
 
app.use(cors({
    origin: process.env.CORS_ORIGIN , // Allow all origins by default
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON and URL-encoded data with increased limits
// Increase the limit to 16kb to handle larger payloads
app.use(express.json({
    limit: '16kb' // Increase the limit to 16kb
}));
app.use(express.urlencoded({
    extended: true,
    limit: '16kb' // Increase the limit to 16kb
}));
app.use(express.static('public'));

// import routes
import healthCheckController from './routes/healthCheck.routes.js'; 

app.use('/api/v1/health', healthCheckController);

export { app };
