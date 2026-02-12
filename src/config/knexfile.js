require("dotenv").config();

module.exports = {
    client: "mssql",
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        options: {
            encrypt: false,
            enableArithAbort: true,
        },
    },
};
