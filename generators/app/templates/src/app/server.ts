import * as Express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import * as morgan from 'morgan';
<% if(botType == 'botframework' || customBot) { %>
import * as builder from 'botbuilder';
<% } %>
<% if(botType == 'botframework' ) { %>
import { <%= botName %> } from './<%= botName %>';
<% } %>
<% if(customBot ) { %>
import { <%= customBotName %> } from './<%= customBotName %>';
<% } %>

let express = Express();
let port = process.env.port || process.env.PORT || 3007;

express.use(bodyParser.json());

express.use(morgan('tiny'));

express.use('/scripts', Express.static(path.join(__dirname, 'web/scripts')));
express.use('/assets', Express.static(path.join(__dirname, 'web/assets')));

<% if(botType == 'botframework') { %>
// Bot hosting 
let botSettings: builder.IChatConnectorSettings = {
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};

let bot = new <%= botName %>(new builder.ChatConnector(botSettings));
express.post('/api/messages', bot.Connector.listen());
<% } %>

<% if(customBot) { %>
// Custom bot
let customBot = new <%= customBotName %>();
express.post('/api/customBot', customBot.requestHandler);
<% } %>


// This is used to prevent your tabs from being embedded in other systems than Microsoft Teams
express.use(function (req: any, res: any, next: any) {
    res.setHeader("Content-Security-Policy", "frame-ancestors teams.microsoft.com *.teams.microsoft.com *.skype.com");
    res.setHeader("X-Frame-Options", "ALLOW-FROM https://teams.microsoft.com/."); // IE11
    return next();
});

// Tabs (protected by the above)
express.use('/\*Tab.html', (req: any, res: any, next: any) => {
    res.sendFile(path.join(__dirname, `web${req.path}`));
});
express.use('/\*Config.html', (req: any, res: any, next: any) => {
    res.sendFile(path.join(__dirname, `web${req.path}`));
});
express.use('/\*Remove.html', (req: any, res: any, next: any) => {
    res.sendFile(path.join(__dirname, `web${req.path}`));
});

// Fallback
express.use(function (req: any, res: any, next: any) {
    res.removeHeader("Content-Security-Policy")
    res.removeHeader("X-Frame-Options"); // IE11
    return next();
});

express.use('/', Express.static(path.join(__dirname, 'web/'), {
    index: 'index.html'
}));

express.set('port', port);
http.createServer(express).listen(port, (err: any) => {
    if (err) {
        return console.error(err);
    }
    console.log(`Server running on ${port}`);

})
