var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../db-config.js');

/* ----- Connects to your mySQL database ----- */

var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* ------------------------------------------- */
/* ----- Routers to handle FILE requests ----- */
/* ------------------------------------------- */

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

/* ----- Q2 (Recommendations) ----- */
router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

/* ----- Q3 (Best Of Decades) ----- */
router.get('/bestof', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

/* ----- Bonus (Posters) ----- */
router.get('/posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

/* Template for a FILE request router:

Specifies that when the app recieves a GET request at <PATH>,
it should respond by sending file <MY_FILE>

router.get('<PATH>', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', '<MY_FILE>'));
});

*/


/* ------------------------------------------------ */
/* ----- Routers to handle data requests ----- */
/* ------------------------------------------------ */

/* ----- Q1 (Dashboard) ----- */
router.get('/genres', function (req, res) {

  var query = `SELECT DISTINCT genre FROM Genres`;
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/genres/:movieGenre', function (req, res) {

  var query = `
  SELECT Movies.title, Movies.rating, Movies.vote_count 
  FROM Movies, Genres 
  WHERE '${req.params.movieGenre}' = Genres.genre AND Genres.movie_id = Movies.id 
  ORDER BY rating DESC, vote_count DESC 
  LIMIT 10`;
    
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});
/* ----- Q2 (Recommendations) ----- */

router.get('/recommendations/:movieTitle', function (req, res){
  var query = `
  WITH
  requiredGenres(genre)
  AS
  (
    SELECT Genres.genre
    FROM Movies, Genres
    WHERE '${req.params.movieTitle}' = Movies.title AND Movies.id = Genres.movie_id
  ),
  newMovieTable(id, numGenre)
  AS
  (
    SELECT g.movie_id, COUNT(g.genre)
    FROM Genres g
    JOIN requiredGenres rg
    ON rg.genre = g.genre
    GROUP BY g.movie_id
  )
SELECT m.title, m.id, m.rating, m.vote_count
FROM Movies m, newMovieTable t
WHERE m.id = t.id AND t.numGenre >= (SELECT COUNT(genre) FROM requiredGenres) 
AND m.title != '${req.params.movieTitle}'
ORDER BY m.rating DESC, m.vote_count DESC
LIMIT 5;
  `;
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


/* ----- Q3 (Best Of Decades) ----- */

router.get('/decades', function(req, res) {
  var query = `
    SELECT DISTINCT (FLOOR(year/10)*10) AS decade
    FROM (
      SELECT DISTINCT release_year as year
      FROM Movies
      ORDER BY release_year
    ) y
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/decades/:year', function (req, res) {

  var query = `
  WITH
  movieInYear(id, genre, title, vote_count, year)
  AS
  (
    SELECT m.id, g.genre, m.title, m.vote_count, m.release_year
    FROM Movies m, Genres g
    WHERE g.movie_id = m.id 
    AND m.release_year >= CAST('${req.params.year}' AS int) AND m.release_year <= CAST('${req.params.year}' AS int) + 9
  ),
  sortGenre(genre, maxCount)
  AS
  (
    SELECT y.genre, MAX(y.vote_count)
    FROM movieInYear y
    GROUP BY y.genre
  )
SELECT s.genre, y.title, s.maxCount as vote_count, y.year as release_year
FROM movieInYear y, sortGenre s
WHERE y.genre = s.genre AND s.maxCount = y.vote_count
GROUP BY y.genre;
  `;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

/* ----- Bonus (Posters) ----- */



/* General Template for GET requests:

router.get('/routeName/:customParameter', function(req, res) {
  // Parses the customParameter from the path, and assigns it to variable myData
  var myData = req.params.customParameter;
  var query = '';
  console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      // Returns the result of the query (rows) in JSON as the response
      res.json(rows);
    }
  });
});
*/


module.exports = router;
