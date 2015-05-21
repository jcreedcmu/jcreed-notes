var express = require('express');
var fs = require('fs');
var mustache = require('mustache');
var request = require('request');
var session = require('express-session');
var file_store = require('session-file-store');

var DEV = process.env.DEV;
var secrets = JSON.parse(fs.readFileSync(process.env.DATADIR + "/secrets", "utf8"));
var session_secret = secrets.session_secret;
var client_id = secrets.client_id;
var client_secret = secrets.client_secret;

var app = express();
var chef_visual_interaction_team_id = 1215862;

var FileStore = file_store(session);

var session_middleware = session({
  resave: false,
  saveUninitialized: false,
  secret: session_secret,
  store: new FileStore(),
});

function login_page(req, res) {
  var template = fs.readFileSync("templates/login.html", "utf8");
  res.end(mustache.to_html(template, {client_id: client_id}));
}

function github_auth_middleware(req, res, next) {
  if (DEV)
    return next();

  if (req.session.access_token) {
    request.get({url: 'https://api.github.com/user/teams',
                 headers: {
                   Accept: "application/json",
                   "User-Agent": "jcreed-notes",
                 },
                 qs: {
                   "access_token": req.session.access_token,
                 }
                },
                function(err, resp, body_json) {
                  if (err) {
                    return console.error('teams api call failed:', err);
                  }
                  var body = JSON.parse(body_json);
                  if (body && body.some
                      && body.some(function(x) {
                        return x.id == chef_visual_interaction_team_id
                      })) {
                    // Success!
                    return next();
                  }
                  else {
                    req.session.access_token = null;
                    login(req, res);
                  }
                });
  }
  else {
    login_page(req, res);
  }
}

app.get('/logout', function(req, res) {
  req.session.access_token = null;
  res.redirect("/");
});

app.get('/github-callback', function(req, res) {
  var code = req.query.code;
  request.post({url: 'https://github.com/login/oauth/access_token',
                headers: {Accept: "application/json"},
                formData: {client_id: client_id,
                           client_secret: client_secret,
                           code: code}},
               function (err, resp, body_json) {
                 if (err) {
                   return console.error('access token generation call failed:', err);
                 }
                 var body = JSON.parse(body_json);
                 if (body.error) {
                   console.log(JSON.stringify(body, null, 2));
                 }
                 else {
                   req.session.access_token = body.access_token;
                   res.redirect("/");
                 }
               });
});

app.use('/api', session_middleware, github_auth_middleware);

app.get('/api/notes', function(req, res) {
  res.end(fs.readFileSync(process.env.DATADIR + "/IDEAS", "utf8"));
});

app.get('/',
        session_middleware,
        github_auth_middleware,
        function(req, res) {
          res.type('.html');
          var template = fs.readFileSync("templates/index.html", "utf8");
          res.end(mustache.to_html(template, {client_id: client_id}));
        });

app.use('/', express.static(__dirname + "/public"));

var port = process.env.PORT || 8080;
app.listen(port);
console.log('Express started on port ' + port);
