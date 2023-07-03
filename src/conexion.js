const mysql = require('mysql');

var connexion = mysql.createConnection({
    host: 'localhost',
    database: 'chat',
    user: 'root',
    password: '123456'
});

connexion.connect(function(error){
    if (error) {
        throw error
    } else {
        console.log("CONEXION EXITOSA");
    }
})

connexion.query('select * from usuario',function(error,results,fields) {
    if (error) throw error
    
    results.forEach(results => {
        module.exports = results;
    });
})