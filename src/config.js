const path = require('path')

const redstoneApi = require("../.secrets/redstoneApi.json");
const SES = require("../.secrets/aws-ses.json");
const dirPath = path.join(__dirname, '../.secrets/aws-config.json')
const mailInfo = require("../.secrets/mail.json");
const mongodbInfo = require("../.secrets/local_mongodb.json");

module.exports = {
    redstoneApi,
    SES,
    dirPath,
    mailInfo,
    mongodbInfo,
};
