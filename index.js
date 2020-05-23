

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
const app = express();
const { google } = require('googleapis');
const port = process.env.PORT || 8080;
const analytics = google.analytics('v3');

/**
 * Create a new OAuth2 client with the configured keys.
 */
// const oauth2Client = new google.auth.OAuth2(
//     keys.client_id,
//     keys.client_secret,
//     redirectUrl
    
// );
app.set('view engine', 'pug')

/**
 * This is one of the many ways you can configure googleapis to use authentication credentials.  In this method, we're setting a global reference for all APIs.  Any other API you use here, like google.drive('v3'), will now use this auth client. You can also override the auth client at the service and method call levels.
 */


const googleAuth = new google.auth.GoogleAuth({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    keyFile: './service-key.json',
    scopes: ['https://www.googleapis.com/auth/analytics']
});
google.options({auth:googleAuth})

/**
 * Open an http server to accept the oauth callback. In this simple example, the only request to our webserver is to /callback?code=<code>
 */
async function auth() {
    return new Promise(async(resolve, reject) => {
        app.use(express.static('public'));
        app.get('/', async function (req, res) {
            let list = {};
            list = await analytics.management.accounts.list()
            res.render(
                'list', { list: JSON.stringify(list.data, null, 4) }
            );

    })
    app.listen(port, () => {
        resolve();
    });
});
}

async function runSample(client) {
    // retrieve user profile
    //const res = await plus.people.get({userId: 'me'});
    //const res = await plus.people.get({userId: 'me'});
    //console.log(analytics);
    console.log(client);
}

const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
auth(scopes)
    .then(client => runSample(client))
    .catch(console.error);

