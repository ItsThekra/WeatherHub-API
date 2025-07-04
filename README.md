
## WeatherHub API

This is a simple Node.js and Express API.  
Users can sign up, sign in, and get weather info by sending latitude and longitude.  
Each request is saved in the user's history.

### What I used:

- Node.js
- Express
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- Axios
- dotenv
- Postman

### API Endpoints:

- POST /api/v1/auth/signup – create new user  
- POST /api/v1/auth/signin – login and get token  
- GET /api/v1/weather?lat=24.7&lon=46.6 – get weather (token required)  
- GET /api/v1/history – get user search history (token required)