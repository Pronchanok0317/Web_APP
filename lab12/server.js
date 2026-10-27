// Compatibility entry point for the Express/Prisma backend.
require('./backend/node_modules/dotenv').config({path:require('path').join(__dirname,'backend/.env')});
require('./backend/src/server');
