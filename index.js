

// Copyright 2012 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const { google } = require('googleapis');
const port = process.env.PORT || 8080;

const keyPath = path.join(__dirname, 'oauth2.keys.json');
const analytics = google.analytics('v3');
let keys = { redirect_uris: [''] };
let token = "";
if (fs.existsSync(keyPath)) {
    keys = require(keyPath).installed;
}
const redirectUrl = (process.env.NODE_ENV === 'production') ? keys.redirect_uris[2] : keys.redirect_uris[1]


/**
 * Create a new OAuth2 client with the configured keys.
 */
const oauth2Client = new google.auth.OAuth2(
    keys.client_id,
    keys.client_secret,
    redirectUrl
    
);
app.set('view engine', 'pug')

/**
 * This is one of the many ways you can configure googleapis to use authentication credentials.  In this method, we're setting a global reference for all APIs.  Any other API you use here, like google.drive('v3'), will now use this auth client. You can also override the auth client at the service and method call levels.
 */
google.options({ auth: oauth2Client });


// oauth2Client.refreshAccessToken(function(err, tokens){
//     console.log(tokens)
//     oauth2Client.credentials = {access_token : tokens.access_token}
// });

oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        // store the refresh_token in my database!
        console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
});



/**
 * Open an http server to accept the oauth callback. In this simple example, the only request to our webserver is to /callback?code=<code>
 */
async function authenticate(scopes) {
    return new Promise((resolve, reject) => {
        // grab the url that will be used for authorization
        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes.join(' '),
        });
        app.use(express.static('public'));
        app.get('/', function (req, res) {
            console.log(token);
            if (token) {
                res.redirect('/data')
            } else {
                res.render(
                    'index', { href: authorizeUrl, label: 'Sign in' }
                );
            }
        })

        app.get('/data', async function (req, res) {
            let list = {};
            list = await analytics.management.accounts.list()
            res.render(
                'list', { list: JSON.stringify(list, null, 4) }
            );

    })

    app.use('/callbackredirect', function (req, res, next) {
        token = req.query.code
        oauth2Client.getToken(token)
            .then((res) => {
                console.log("tokenRes", res)
                oauth2Client.setCredentials(res.tokens);
                next()
            })
            .catch((err) => next())
    });
    app.get('/callbackredirect', function (req, res) {

        if (token) {
            res.redirect('/data')
        } else {
            res.redirect('/')
        }
        // res.send(
        //     analytics.management.accounts.list()
        // );
    });//
    app.listen(port, () => {
        resolve(oauth2Client);
    });
});
}

async function runSample(client) {
    // retrieve user profile
    //const res = await plus.people.get({userId: 'me'});
    //const res = await plus.people.get({userId: 'me'});
    //console.log(analytics);
    console.log("test");
}

const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
authenticate(scopes)
    .then(client => runSample(client))
    .catch(console.error);

