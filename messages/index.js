"use strict";

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

bot.dialog('/', intents);    

intents
    .matches(/^hello/i, function (session) {
        session.send("Hi there!");
    })
    .matches(/^help/i, function (session) {
        session.send("You asked for help.");
    })
    .matches(/^\/profile/i, function (session) {
        session.beginDialog('/profile');
    })
    //LUIS intent matches
    .matches('AzureCompliance', '/compliance')
    .matches('OfficeHours', '/officehours')
    .matches('SupportRequest', '/support')
    .matches('Documentation', '/documentation')
    .matches('BizSpark', '/bizspark')
    .matches('Introduction', '/introductions')
    .matches('Rude', '/rude')
    .onDefault('/didnotunderstand');

bot.dialog('/compliance', [
    function (session, args) {
        builder.Prompts.text(session, "You asked about Azure Compliance. Is that correct?");
    },
    confirmIntent
]);
bot.dialog('/officehours', [
    function (session, args) {
        builder.Prompts.text(session, "You asked about Office Hours. Is that correct?");
    },
    //confirmIntent,
    function (session, results, args) {
        if (results.response.toLowerCase() == 'y' || results.response.toLowerCase() == 'yes') {
            // Get subjects
            console.log("Getting subjects...");
            request.get({
                url: 'https://calendarhelper.azurewebsites.net/api/OfficeHoursTopics?code=1q83kb64qa3ps7zkobks70bprqvj7r4w5vqc'
            }, function(error, response, body){
                if(error) {
                    console.log(error);
                } else {
                    result = JSON.parse(body);
                    resultTopics = result;
                    console.log(response.statusCode, resultTopics);
                    builder.Prompts.choice(session, "What topic would you like to meet about?", resultTopics);
                }
            });
        } else {
            session.endDialog("Darn. Ok, I've logged this for review.");
        }
    }, function (session, results, next) {
        if(results.response && resultTopics.indexOf(results.response.entity) !== -1) {
            session.dialogData.officeHoursTopic = results.response.entity;
            builder.Prompts.choice(session, "When would you like to schedule your office hour?", ["Morning", "Afternoon"]);
        } else {
            session.send("Umm...huh?");
        }
    }, function (session, results, next) {
        if(results.response && ["Morning", "Afternoon"].indexOf(results.response.entity) !== -1) {
            session.dialogData.officeHoursTime = results.response.entity;
            var firstName = session.userData.name.split(" ")[0];
            var lastName = session.userData.name.split(" ")[1];

            console.log("Making meeting request...");

            var requestData = {
                "Topic": session.dialogData.officeHoursTopic,
                "ReqestorFirstName": firstName,
                "ReqestorLastName": lastName,
                "ReqestorEmailAddress": session.userData.email,
                "RequestedConversation": session.dialogData.officeHoursTopic,
                "RequestedDayHalf": session.dialogData.officeHoursTime,
                "IsTest": "false"
            };

            console.log(requestData);

            // Request meeting
            request.post({
                headers: {'content-type' : 'application/json'},
                url: 'https://startupcalendarhelper.azurewebsites.net/api/RequestTopicExpert?code=6yy62ob12opbsym3ombgkeudrq0dcws1fk04',
                json: true,
                body: requestData,
            }, function(error, response, body){
                if(error) {
                    console.log(error);
                } else {
                    session.endDialog("Thanks! You should receive an email to schedule your office hours.");
                    result = body;
                    console.log(response.statusCode, result);
                }
            });
        } else {
            session.send("Umm...huh?");
        }
    }
]);
bot.dialog('/support', [
    function (session, args) {
        builder.Prompts.text(session, "You made a Support Request. Is that correct?");
    },
    confirmIntent
]);
bot.dialog('/documentation', [
    // function (session, args) {
    //     session.send("You asked about Documentation.");
    //     builder.Prompts.choice(session, "Which OS?", ["Windows", "Linux"]);
    // },
    //confirmIntent,
    function (session, results) {
        console.log("call to https://directline.botframework.com/api/conversations");

        var options = {
            url: 'https://directline.botframework.com/api/conversations',
            headers: {
                'Authorization': 'BotConnector O2jX7ZXszCM.cwA.Kdk.TdqsFsXKRqtF_YazbQIqvgp1RmRelnHKOrDa_1NdaQY'
            }
        };
        request.post(
            options, 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );


        // Fake it!
        var baseUrl = 'https://azure.microsoft.com/en-us/documentation/services/virtual-machines/'
        session.send("Here's how to get started with %s virtual machines: " + baseUrl + "%s/", results.response.entity, results.response.entity);

        session.endDialog();
    }
]);
bot.dialog('/profile', [
    function (session, args) {
        session.send("I'd like to ask some questions to learn more about you and your startup.");
        builder.Prompts.text(session, "First, what's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.text(session, "Hi " + results.response + ", What's the name of your startup?"); 
    },
    // function (session, results) {
    //     session.userData.startup = results.response;
    //     builder.Prompts.text(session, "What is your email address?"); 
    // },
    // function (session, results) {
    //     session.userData.email = results.response;
    //     builder.Prompts.choice(session, "What's your primary coding language?", [".NET", "Node.js", "Ruby on Rails", "PHP", "Java"]);
    // },
    // function (session, results) {
    //     session.userData.languageChoice = results.response;
    //     builder.Prompts.choice(session, "What data store do you primarily use?", ["SQL Database", "Postgres", "MySQL", "Oracle", "MongoDB"]);
    // },
    function (session, results) {
        //session.userData.databaseChoice = results.response;
        session.send("Got it... " + session.userData.name + 
                     " your startup is " + session.userData.startup);

        session.endDialog();
    }
]);
bot.dialog('/bizspark', [
    function (session, args) {
        builder.Prompts.text(session, "You asked about BizSpark. Is that correct?");
    },
    confirmIntent
]);
bot.dialog('/introductions', [
    function (session, args) {
        console.log("Wants an introduction!");

        session.send("I've logged this request and someone from the US Startups team will get back to you!");

        var requestData = {
                "Name": "Hooli",
                "ContactName": "Peter Parker",
                "ContactEmail": "peter@hooli.com",
                "Category": "Documentation",
                "Inquiry": "We would like to work with media services and video compression",
                "Location": "Silicon Valley"
                };

        request.post({
                headers: {'content-type' : 'application/json'},
                url: 'http://startupconnector.azurewebsites.net/api/cards/',
                json: true,
                body: requestData,
            }, 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );
        session.endDialog();
    }
]);
bot.dialog('/rude', function (session, args) {
    session.endDialog("Well, you're just being rude.");
});
bot.dialog('/didnotunderstand', [
    function (session, args) {
        console.log("[Utterance]", session.message.text);
        builder.Prompts.text(session, "I'm sorry. I didn't understand, but I'm learning. What was your intent here?")
    }, 
    function (session, results) {
        console.log("[Intent]", session.message.text);
        session.endDialog("Ok, I've logged this for review. Please ask another question.");
    }
]);

// Install First Run middleware and dialog
bot.use(builder.Middleware.firstRun({ version: 1.0, dialogId: '*:/firstRun' }));
bot.dialog('/firstRun', [
    function (session) {
        session.send("Hello... I'm the Microsoft Startup Bot.");
        session.endDialog("Ask me a  question and I'll try to help.");
        
        // if (!session.userData.name) {
        //     session.beginDialog('/profile');
        // }
    },
    function (session) {
        // session.endDialog("Ask me a  question and I'll try to help."); 
    }
]);

function confirmIntent (session, results) {
    console.log("confirmation attempt")
    if (results.response.toLowerCase() == 'y' || results.response.toLowerCase() == 'yes') {
        session.endDialog("Ok, I'm getting the hang of things.");
    } else {
        session.endDialog("Darn. Ok, I've logged this for review.");
    }          
}

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

