Create folders client and server.

In Server Folder =
    npm i and npm install 
    npm i mongoose dotenv  cors express middleware
    npm i -D nodemon

In package.json =
    "start": "node index.js",
    "dev": "nodemon index.js",

Create .gitignore file in server folder and add .env



connect to mongodb atlas


Login Signup and  OTP System (Authentication (check Identity) or Basic Authorization (permission if it is user or admin))

Make login signup otp function  (auth.js giving routes, authController doing actual function or work , OTP Schema, User Schema).


Middleware means: a checking/processing function that runs before the main function.
Make Middleware which checks if user is login or role has admin in middleware file

Create Events (Event Schema ,Event Routes, Event Controller (by using middleware functions)) 

Create Bookings (Booking Schema, Booking Routes, Booking Controller,Otp verification with booking system ) 

Make Seed File for fake data And Checking
