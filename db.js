const mongoose = require("mongoose");
const DB_URL = process.env.MONGO_URL || 'mongodb://localhost/test';
class DatabaseConnection {

    setup() {
        console.log(`[DB] Connecting to ${DB_URL}`);

        mongoose.connection.once('connected', () => {
            console.log("[DB] Connection Established");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("[DB] Connection Reestablished");
        });

        mongoose.connection.on("disconnected", () => {
            console.log("[DB] Connection Disconnected");
        });

        mongoose.connection.on("close", () => {
            console.log("[DB] Connection Closed");
        });

        mongoose.connection.on("error", (err) => {
            console.log(`[DB] Error happened: ${err}`);
        });

        // Create DB connection
        return mongoose.connect(DB_URL, { useNewUrlParser: true,  useCreateIndex: true,  useUnifiedTopology: true, useFindAndModify: false });
    }

    close() {
        return new Promise((resolve, reject) => {
            mongoose.connection.close(err => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

/**
 * @typedef DatabaseError
 * @property {string} reason.required - Textual representation of the error
 */

module.exports = DatabaseConnection;