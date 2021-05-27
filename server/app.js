require('dotenv').config();
const Express = require('express');
const app = Express();
const dbConnection = require('./db')

app.use(Express.json()); //this app.use statement MUST go above any routes so they can use this function

const controllers = require('./controllers');

app.use('/user', controllers.userController);

// app.use(require('./middleware/validate-jwt')); //items below will need a token to access (user does not, journal does)
app.use('/journal', controllers.journalController);

dbConnection.authenticate()
    .then (() => dbConnection.sync())
    .then (() => {
        app.listen(3000, () =>{
            console.log(`[Server]: App is listening on 3000`);
        });
    })
    .catch((err) =>{
        console.log(`[Server]: Server Crashed. Error = ${err}`);
    });

// app.listen(3000, ()=>{
//     console.log(`[Server]: App is listening on 3000`);
// })