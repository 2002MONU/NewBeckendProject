import dotenv from "dotenv";
import {app} from './app.js';
import connectDB from "./db/index.js";
// Import the constants file
// import {DB_NAME} from "./constants.js";
dotenv.config({
    path: "./.env"
});
const PORT = process.env.PORT || 8001;

connectDB()
    .then((result) => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        console.log("Database connection established");
    }).catch((err) => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });


