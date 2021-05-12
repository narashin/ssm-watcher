'use strict';

module.exports.SSMWatcher = async event => {
  const AWS = require('aws-sdk');
  const { IncomingWebhook } = require('@slack/webhook');

  const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
  const ec2 = new AWS.EC2();

  let eventInfo = {
    "eventTime" : event.detail.eventTime,
    "eventName" : event.detail.eventName,
    "awsRegion" : event.detail.awsRegion,
    "sourceIPAddress": event.detail.sourceIPAddress,
    "target" : event.detail.requestParameters.target,
    "userName":  event.detail.userIdentity.userName,
    "targetPrivateIP" : '',
    "targetName" : '', 
  }


  function getInstanceInfo(eventInfo){
    let params = {
      InstanceIds : [eventInfo.target]
    }
    return new Promise((resolve, reject) => {
      ec2.describeInstances(params, function(err, data){
        if (err) reject(err);
        else { 
          var privateIpAddress = data.Reservations[0].Instances[0].PrivateIpAddress;
          if(Object.values(data.Reservations[0].Instances[0].Tags[0]).includes('Name')){
             var targetName = data.Reservations[0].Instances[0].Tags[0].Value;
          }
        }
        resolve({"privateIpAddress" : privateIpAddress, "targetName" : targetName});
      });
    }) 
  }

  function formattingMessage(eventInfo){
    let slackText = {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `:rotating_light: *Detected that Session Was Activated By ${eventInfo.userName}*`
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": `*When:*\n${eventInfo.eventTime}`
            },
            {
              "type": "mrkdwn",
              "text": `*Where:*\n${eventInfo.sourceIPAddress}`
            },
            {
              "type": "mrkdwn",
              "text": `*Region:*\n${eventInfo.awsRegion}`
            },
            {
              "type": "mrkdwn",
              "text": `*Instance ID:*\n${eventInfo.target}`
            },
            {
              "type": "mrkdwn",
              "text": `*Instance Name:*\n${eventInfo.targetName}`
            },
            {
              "type": "mrkdwn",
              "text": `*Private IP:*\n${eventInfo.targetPrivateIP}`
            }
          ]
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "image",
              "image_url": "https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/modules/aws-application-deployment-and-monitoring/monitor-your-aws-resources/images/8d6be734df26b2439f920fa9b32d06c4_3-a-73-bde-0-dd-17-4-ae-7-a-1-fb-465398-a-98963.png",
              "alt_text": "cloudtrail"
            },
            {
              "type": "mrkdwn",
              "text": "CloudTrail Event Logs are Delivered every 5 (active) minutes with up to 15-minute delay."
            }
          ]
        }
      ]
    }
    return slackText;
  }

  (async () => {
    await getInstanceInfo(eventInfo).then((data) => {
      eventInfo.targetPrivateIP = data.privateIpAddress
      eventInfo.targetName = data.targetName
    }).then(() => {
      webhook.send(formattingMessage(eventInfo));
    });
  })();
};
