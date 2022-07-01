// IMPORTING DEPENDENCIES
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();

// SETTING BODY PARSER TO USE urlencoded or JSON for requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    extended: true
}));


// SETTING Port to 3000
port = 3000


app.route('/split-payments/compute')
    .post((req, res) => {

        //SET RESPONSE HEADERS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST");
        res.setHeader("Content-Type", "application/json");

        //ACCESS PAYLOAD FROM REQUEST BODY
        const payload = req.body;

        //SET RESPONSE TEMPLATE
        var response = {
            ID: payload.ID,
            Balance: payload.Amount,
            SplitBreakdown: []
        };

        // GET SPLIT INFO FROM PAYLOAD
        const splitInfo = payload.SplitInfo;

        // filter out the FLAT split type from splitInfo and store in its array
        var flatInfo = splitInfo.filter((entry) => {
            return entry.SplitType == "FLAT";
        });

        // filter out the PERCENTAGE split type from splitInfo and store in its array
        var percentageInfo = splitInfo.filter((entry) => {
            return entry.SplitType == "PERCENTAGE";
        });

        // filter out the RATIO split type from splitInfo and store in its array
        var ratioInfo = splitInfo.filter((entry) => {
            return entry.SplitType == "RATIO";
        });

        // Loop through the entries with FLAT Split type first
        flatInfo.forEach((entry) => {

            // Deduct the amount from the balance
            response.Balance -= entry.SplitValue
            //Update the split breakdown
            response.SplitBreakdown.push({
                SplitEntityId: entry.SplitEntityId,
                Amount: entry.SplitValue
            })

        })

        // Loop through the entries with PERCENTAGE Split type second
        percentageInfo.forEach((entry) => {

            //get percentage value
            var percentageValue = (entry.SplitValue / 100) * response.Balance;
            // Deduct the amount from the balance
            response.Balance -= percentageValue;
            //Update the split breakdown
            response.SplitBreakdown.push({
                SplitEntityId: entry.SplitEntityId,
                Amount: percentageValue
            })

        })

        //USE Remaining balance to handle the ratios

        var totalRatio = 0; //Stores the total ratio

        var ratioValue = 0; //Stores the total amount of entries with ratio split type

        //Calculate total ratio
        ratioInfo.forEach((entry) => {

            totalRatio += entry.SplitValue

        })

        ratioInfo.forEach((entry) => {

            //store entry value
            var value = (entry.SplitValue / totalRatio) * response.Balance;
            // update total ratio value
            ratioValue += value;
            //Update the split breakdown
            response.SplitBreakdown.push({
                SplitEntityId: entry.SplitEntityId,
                Amount: value
            })

        })

        //Update balance finally after doing all ratios
        response.Balance -= ratioValue



        res.send(response)

    });

app.listen(port, () => {
    console.log(`Server is running! Port: ${port}`)
})