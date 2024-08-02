require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { getAuthUrl, getAuthenticatedClient, oauth2Client, listAccounts, listCategories, listGroups, createLocationGroup, listLocations, getLocationDetails, deleteLocation, getVerificationOptions, requestVerification, pendingVerification, completeVerification, listAttributes } = require('./auth');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.get('/auth-url', (req, res) => {
    const url = getAuthUrl();
    res.send({ url });
});

app.post('/callback', async (req, res) => {
    const { code } = req.body;
    const client = await getAuthenticatedClient(code);
    res.send({ tokens: client.credentials });
});

app.post('/list-accounts', async (req, res) => {
    const { tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const accounts = await listAccounts(oauth2Client);
        res.send(accounts);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/create-location-group', async (req, res) => {
    const { groupName, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const group = await createLocationGroup(oauth2Client, groupName, process.env.ACCOUNT_ID);
        res.send(group);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/list-groups', async (req, res) => {
    const { tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const groups = await listGroups(oauth2Client);
        res.send(groups);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


app.post('/list-categories', async (req, res) => {
    const { tokens } = req.body;
    const { filter } = req.body;
    oauth2Client.setCredentials(tokens);

    try {
        const categories = await listCategories(oauth2Client, filter);
        res.send(categories);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/add-location', async (req, res) => {
    const { location, tokens } = req.body;
    oauth2Client.setCredentials(tokens);

    const mybusinessbusinessinformation = google.mybusinessbusinessinformation('v1');
    try {
        const response = await mybusinessbusinessinformation.accounts.locations.create({
            parent: 'accounts/' + process.env.LOCATION_GROUP_ID,
            // validateOnly: true,
            requestId: uuidv4(),
            requestBody: {


                // "name": "EVgo Charging Station",
                "languageCode": "en",
                // "storeCode": "EVG123",
                "title": "6sense Station",
                "phoneNumbers": {
                    "primaryPhone": "+8801234567891"
                },
                "categories": {
                    "primaryCategory": {
                        "name": "gcid:electric_vehicle_charging_station",
                        // "displayName": "Electric vehicle charging station",
                    },
                },
                "storefrontAddress": {
                    "regionCode": "BD",
                    "locality": "Dhaka",
                    "postalCode": "1219",
                    // "administrativeArea": "Dhaka",
                    "addressLines": ["G Block Banasree", "Dhaka 1219"]
                },
                // "websiteUri": "https://6sensehq.com",
                // "regularHours": {
                //     "periods": [
                //         {
                //             "openDay": "MONDAY",
                //             "openTime": {
                //                 "hours": 0,
                //                 "minutes": 0
                //             },
                //             "closeDay": "SUNDAY",
                //             "closeTime": {
                //                 "hours": 23,
                //                 "minutes": 59
                //             }
                //         }
                //     ]
                // },
                // "specialHours": {
                //     "specialHourPeriods": [
                //         {
                //             "startDate": {
                //                 "year": 2024,
                //                 "month": 12,
                //                 "day": 25
                //             },
                //             "endDate": {
                //                 "year": 2024,
                //                 "month": 12,
                //                 "day": 25
                //             },
                //             "closed": true
                //         }
                //     ]
                // },
                "labels": [
                    "EV Charging",
                    "Charge OnSite",
                    "Fast Charging"
                ],
                "latlng": {
                    "latitude": 23.760716,
                    "longitude": 90.438152
                },
                // "openInfo": {
                //     "status": "OPEN",
                //     "canReopen": true
                // },
                // "metadata": {
                //     "mapsUri": "https://maps.google.com/?q=EVgo+Charging+Station",
                //     "newReviewUri": "https://maps.google.com/review?place_id=ChIJzxbB6Gs7bIcRZZrPTeyb-0A"
                // },
                "profile": {
                    "description": "Fast and reliable electric vehicle charging station."
                },
                // "relationshipData": {
                //     "parentChain": "EVgo"
                // },
                // "moreHours": [
                //     {
                //         "hoursTypeId": "DRIVE_THROUGH",
                //         "periods": [
                //             {
                //                 "openDay": "MONDAY",
                //                 "openTime": {
                //                     "hours": 0,
                //                     "minutes": 0
                //                 },
                //                 "closeDay": "SUNDAY",
                //                 "closeTime": {
                //                     "hours": 23,
                //                     "minutes": 59
                //                 }
                //             }
                //         ]
                //     }
                // ],
            },
            auth: oauth2Client
        });
        console.log(response)
        res.send(response.data);
    } catch (error) {
        console.error(error)
        res.status(400).send({ error: error.message });
    }
});

app.post('/list-locations', async (req, res) => {
    const { groupId, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const locations = await listLocations(oauth2Client, process.env.LOCATION_GROUP_ID);
        res.send(locations);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/get-location-details', async (req, res) => {
    const { locationId, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const locationDetails = await getLocationDetails(oauth2Client, locationId);
        const address = encodeURIComponent(`${locationDetails.storefrontAddress.addressLines.join(', ')}, ${locationDetails.storefrontAddress.locality}, ${locationDetails.storefrontAddress.regionCode}, ${locationDetails.storefrontAddress.postalCode}`);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}&query_place_id=${locationId}&center=${locationDetails.latlng.latitude},${locationDetails.latlng.longitude}&zoom=17`;
        locationDetails['googleMapsUrl'] = googleMapsUrl;
        res.send(locationDetails);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/delete-location', async (req, res) => {
    const { locationId, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        await deleteLocation(oauth2Client, locationId);
        res.send({ message: "Location deleted successfully" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post("/get-verification-options", async (req, res) => {
    const { locationId, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const options = await getVerificationOptions(oauth2Client, locationId);
        res.send(options);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/request-verification', async (req, res) => {
    const { locationId, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const verification = await requestVerification(oauth2Client, locationId);
        res.send(verification);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/pending-verification', async (req, res) => {
    const { locationId, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const verification = await pendingVerification(oauth2Client, locationId);
        res.send(verification);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/complete-verification', async (req, res) => {
    const { verify, tokens, pin } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const verification = await completeVerification(oauth2Client, verify, pin);
        res.send(verification);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/get-place-id', async (req, res) => {
    // const { locationName, locationAddress, tokens } = req.body;
    const { locationName, locationAddress } = req.body;

    // Simulate creating a location by searching for a similar existing place
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
            params: {
                query: `${locationName}, ${locationAddress}`,
                key: process.env.GOOGLE_API_KEY,
            },
        });

        if (response.data.results.length > 0) {
            const placeId = response.data.results[0].place_id;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;
            res.send({ placeId, googleMapsUrl });
        } else {
            res.status(404).send({ error: 'No similar place found' });
        }
    } catch (error) {
        console.error('Error creating test location:', error);
        res.status(500).send({ error: 'Error creating test location' });
    }
});

app.post('/list-attributes', async (req, res) => {
    const { locationId, tokens } = req.body;
    oauth2Client.setCredentials(tokens);
    try {
        const attributes = await listAttributes(oauth2Client, locationId);
        res.send(attributes);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
