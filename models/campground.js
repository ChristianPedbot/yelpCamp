const mysql = require('mysql');
const Schema = mysql.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

module.exports = mysql.model('Campgorund', CampgroundSchema);