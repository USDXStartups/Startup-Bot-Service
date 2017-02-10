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

var luisAzureAppId = process.env.LuisAzureAppId;
var luisAzureAPIKey = process.env.LuisAzureAPIKey;

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
const LuisAzureModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAzureAppId + '&subscription-key=' + luisAzureAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var azureRecognizer = new builder.LuisRecognizer(LuisAzureModelUrl);

var intents = new builder.IntentDialog({ recognizers: [recognizer, azureRecognizer] })

// CREATE LOOKUP TABLES
// AWS lookup table
var awsToAzure = {
    "ec2": "[Virtual Machines](https://docs.microsoft.com/en-us/azure/virtual-machines/)",
    "elastic block store": "[Page Blobs](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-linux-about-disks-vhds?toc=%2fazure%2fvirtual-machines%2flinux%2ftoc.json) or [Premium Storage](https://azure.microsoft.com/en-us/services/storage/disks/)",
    "ebs": "[Page Blobs](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-linux-about-disks-vhds?toc=%2fazure%2fvirtual-machines%2flinux%2ftoc.json) or [Premium Storage](https://azure.microsoft.com/en-us/services/storage/disks/)",
    "ec2 container service": "[Container Service](https://azure.microsoft.com/en-us/services/container-service/)",
    "lambda": "[Functions](https://docs.microsoft.com/en-us/azure/azure-functions/index)",
    "elastic beanstalk": "[Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/)",
    "s3": "[Blob Storage](https://azure.microsoft.com/en-us/services/app-service/web/)",
    "elastic file system": "[File Storage](https://azure.microsoft.com/en-us/services/storage/files/)",
    "efs": "[File Storage](https://azure.microsoft.com/en-us/services/storage/files/)",
    "glacier": "[Backup](https://azure.microsoft.com/en-us/services/backup/) or [Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)",
    "storage gateway": "[StorSimple](https://azure.microsoft.com/en-us/services/storsimple/)",
    "cloudfront": "[Content Delivery Network](https://azure.microsoft.com/en-us/services/cdn/)",
    "vpc": "[Virtual Network](https://azure.microsoft.com/en-us/services/virtual-network/)",
    "virtual private cloud": "[Virtual Network](https://azure.microsoft.com/en-us/services/virtual-network/)",
    "route 53": "[DNS](https://azure.microsoft.com/en-us/services/dns/) or [Traffic Manager](https://azure.microsoft.com/en-us/services/traffic-manager/)",
    "direct connect": "[ExpressRoute](https://azure.microsoft.com/en-us/services/expressroute/)",
    "elastic load balancing": "[Load Balancer](https://azure.microsoft.com/en-us/services/load-balancer/) or [Application Gateway](https://azure.microsoft.com/en-us/services/application-gateway/)",
    "rds": "[SQL Database](https://azure.microsoft.com/en-us/services/sql-database/)",
    "dynamodb": "[DocumentDB](https://azure.microsoft.com/en-us/services/documentdb/)",
    "redshift": "[SQL Data Warehouse](https://azure.microsoft.com/en-us/services/sql-data-warehouse/)",
    "simpledb": "[Table Storage](https://azure.microsoft.com/en-us/services/storage/tables/)",
    "elasticache": "[Azure Redis Cache](https://azure.microsoft.com/en-us/services/cache/)",
    "data pipeline": "[Data Factory](https://azure.microsoft.com/en-us/services/data-factory/)",
    "kinesis": "[Event Hubs](https://azure.microsoft.com/en-us/services/event-hubs/), [Stream Analytics](https://azure.microsoft.com/en-us/services/stream-analytics/), or [Data Lake Analytics](https://azure.microsoft.com/en-us/services/data-lake-analytics/)",
    "simple notification service": "[Notification Hubs](https://azure.microsoft.com/en-us/services/notification-hubs/)"
}

var stacks = {
    "node": "[Node Developer Center](https://azure.microsoft.com/en-us/develop/nodejs/)",
    "node . js": "[Node Developer Center](https://azure.microsoft.com/en-us/develop/nodejs/)",
    "ruby": "[Ruby Developer Center](https://azure.microsoft.com/en-us/develop/ruby/)",
    "ruby on rails": "[Ruby Developer Center](https://azure.microsoft.com/en-us/develop/ruby/)",
    "rails": "[Ruby Developer Center](https://azure.microsoft.com/en-us/develop/ruby/)",
    "python": "[Python Developer Center](https://azure.microsoft.com/en-us/develop/python/)",
    "php": "[PHP Developer Center](https://azure.microsoft.com/en-us/develop/php/)",
    "docker": "[Azure Container Service](https://azure.microsoft.com/en-us/services/container-service/)"
}

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
    .matches('CreateVM', '/vm')
    .matches('GetRegions', '/regions')
    .matches('GetPricingInfo', '/pricing')
    .matches('GetStarted', '/gettingstarted')
    .matches('GetManagementInfo', '/manageresources')
    .matches('GetStackInfo', '/stack')
    .matches('GetWebAppHostingInfo', '/webhosting')
    .matches('GetAWSTranslation', '/aws')
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
bot.dialog('/vm', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        var vmType = builder.EntityRecognizer.findEntity(args.entities, 'VMType');
        var vm = session.dialogData.vm = {
          vmType: vmType ? vmType.entity : null
        };
        // Prompt for vmType
        if (!vm.vmType) {
            builder.Prompts.text(session, 'Windows or Linux?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var vm = session.dialogData.vm;
        if (results.response.toLowerCase() === 'windows' || results.response.toLowerCase() === 'linux') {
            vm.vmType = results.response;
            next();
        } else {
            session.endDialog("I'm sorry, I don't know about %s virtual machines", results.response);
        }
    },
    function (session, results) {
        var baseUrl = 'https://azure.microsoft.com/en-us/documentation/services/virtual-machines/'
        session.endDialog("Here's how to get started with %s virtual machines: " + baseUrl + "%s/", session.dialogData.vm.vmType, session.dialogData.vm.vmType);
    }
]);
bot.dialog('/regions', [
    function (session, args, next) {
        //TODO: Add location-specific logic.
        session.endDialog("Azure currently has datacenters in the following locations:\n* Virginia\n* Iowa\n* Illinois\n* Texas\n* California\n* Quebec City\n* Toronto\n* Sao Paulo State\n* Ireland\n* Netherlands\n* Frankfurt\n* Magdeburg\n* Cardiff\n* Singapore\n* Hong Kong\n* New South Wales\n*  Victoria\n* Pune\n* Mumbai\n* Chennai\n* Tokyo\n* Osaka\n* Shanghai\n* Beijing\n* Seoul.\n For more info, see [Azure Regions](https://azure.microsoft.com/en-us/regions/)");
    }
]);
bot.dialog('/pricing', [
    function (session, args, next) {
        //TODO: Add service-specific logic.
        session.endDialog("To get a pricing estimate for your specific scenario, check out the Azure pricing calculator: https://azure.microsoft.com/en-us/pricing/calculator/");
    }
]);
bot.dialog('/gettingstarted', [
    function (session, args, next) {
        //TODO: Add service-specific logic.
        session.endDialog("Here are some resources to get you started: [Azure Documentation](https://docs.microsoft.com/en-us/azure/), [Azure for Startups GitHub Repository](https://github.com/Azure-for-Startups/Content/blob/master/README.md), [Get Started Guide for Azure Developers](https://opbuildstorageprod.blob.core.windows.net/output-pdf-files/en-us/guides/azure-developer-guide.pdf), [Azure Tools and SDKs](https://docs.microsoft.com/en-us/azure/#pivot=sdkstools)");
    }
]);
bot.dialog('/manageresources', [
    function (session, args, next) {
        session.endDialog("You can create and manage your Azure services programmatically or through the [Azure Portal](portal.azure.com). If you're a Mac user, install the [Azure CLI](https://docs.microsoft.com/en-us/azure/xplat-cli-install), and for Windows, leverage [Azure Powershell commandlets](https://docs.microsoft.com/en-us/powershell/azureps-cmdlets-docs/).  Or if you want, call the REST APIs directly: [Azure REST SDK reference](https://docs.microsoft.com/en-us/rest/api/).  And finally, [Azure Resource Manager](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-overview)...use this when you want a template-based deployment for all the things.  There's a bunch of [Quickstart templates](https://github.com/Azure/azure-quickstart-templates) already on GitHub that you can start with.");
    }
]);
bot.dialog('/stack', [
    function (session, args, next) {
        var stack = builder.EntityRecognizer.findEntity(args.entities, 'LanguagesFrameworks');
        var sdkUrl = "[SDKs and Tools](https://docs.microsoft.com/en-us/azure/#pivot=sdkstools)";
        var result = "";
        if (stack) {
            var entity = stack.entity;
            if (!(entity in stacks)) {
                result = "We support lots of languages and frameworks. Take a look at our " + sdkUrl + " to get started."
            } else {
                result = "Yep, you can run " + entity + " on Azure. Check out our " + stacks[entity] + ". The " + sdkUrl + " page is pretty helpful too."
            }
        } else {
            result = "We support lots of languages and frameworks. Take a look at our " + sdkUrl + " to get started."
        }
        session.endDialog(result);
    }
]);
bot.dialog('/webhosting', [
    function (session, args, next) {
        session.endDialog("Web apps are pretty sweet, but you could also use raw VMs if you need more control.  Cloud services are a happy medium in between the two.  Check out this guide on choosing between [Web Apps, Cloud Services, and VMs](https://docs.microsoft.com/en-us/azure/app-service-web/choose-web-site-cloud-service-vm)")
    }
]);
bot.dialog('/aws', [
    function (session, args, next) {
        var awsService = builder.EntityRecognizer.findEntity(args.entities, 'AWSService');

        var result = "";
        if (awsService) {
            var entity = awsService.entity;
            if (!(entity in awsToAzure)) {
                result = "Check out this [Azure and AWS](https://azure.microsoft.com/en-us/overview/azure-vs-aws/mapping/) chart where you can see what services map to what.";
            } else {
                result = "Look into " + awsToAzure[entity] + ". Also, here's a guide for translating [Azure and AWS](https://azure.microsoft.com/en-us/overview/azure-vs-aws/mapping/)."
            }
        } else {
            result = " Check out this [Azure and AWS](https://azure.microsoft.com/en-us/overview/azure-vs-aws/mapping/) chart where you can see what services map to what."
        }
        session.endDialog(result);
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

