// info en README.md
const express = require('express');
const router = express.Router();
const {verifyT, isAdmin} = require('../middleware/authMiddleware');

// Todas las rutas pretegidas  verificando que sea admin
    router.post('/mProducts',verifyT,isAdmin);
    router.put('/mProducts/:id',verifyT,isAdmin);
    router.delete('/mProducts/:id',verifyT,isAdmin);
    router.get('/mProducts/inventory',verifyT,isAdmin);

    router.get('/sales/chart',verifyT,isAdmin);
    router.get('/sales/total',verifyT,isAdmin);
    
    router.get('/inventory',verifyT,isAdmin);

module.exports = router;