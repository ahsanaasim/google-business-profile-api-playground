const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const getAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/business.manage'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
};

const getAuthenticatedClient = async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return oauth2Client;
    } catch (error) {
        console.error('Error getting tokens:', error);
        throw error;
    }
};

const listAccounts = async (auth) => {
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement('v1');
    try {
        const response = await mybusinessaccountmanagement.accounts.list({
            auth: auth
        });
        return response.data.accounts;
    } catch (error) {
        console.error('Error listing accounts:', error);
        throw error;
    }
};

const createLocationGroup = async (auth, groupName, primaryOwner) => {
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement('v1');
    try {
        const response = await mybusinessaccountmanagement.accounts.create({
            auth: auth,
            requestBody: {
                accountName: groupName,
                primaryOwner: 'accounts/' + primaryOwner,
                type: 'LOCATION_GROUP'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating location group:', error);
        throw error;
    }
};

const listGroups = async (auth) => {
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement('v1');
    try {
        const response = await mybusinessaccountmanagement.accounts.list({
            auth: auth
        });
        const locationGroups = response.data.accounts.filter(account => account.type === 'LOCATION_GROUP');
        return locationGroups;
    } catch (error) {
        console.error('Error listing location groups:', error);
        throw error;
    }
};

const listCategories = async (auth, filter) => {
    console.log(filter)
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation('v1');
    try {
        const response = await mybusinessbusinessinformation.categories.list({
            auth: auth,
            // pageSize: 10,
            // params: {
            regionCode: 'US',
            languageCode: 'en',
            view: 'FULL',
            filter: filter
            // }
        });
        return response.data.categories;
    } catch (error) {
        console.error('Error listing categories:', error);
        throw error;
    }
};

const listLocations = async (auth, groupId) => {
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation('v1');
    try {
        const response = await mybusinessbusinessinformation.accounts.locations.list({
            parent: `accounts/${groupId}`,  // Ensure this format
            readMask: 'name,title,phoneNumbers,categories,profile,metadata',
            auth: auth
        });
        return response.data;
    } catch (error) {
        console.error('Error listing locations:', error);
        throw error;
    }
};

const getLocationDetails = async (auth, locationId) => {
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation('v1');
    try {
        const response = await mybusinessbusinessinformation.locations.get({
            name: 'locations/' + locationId,
            readMask: 'name,languageCode,storeCode,title,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours,specialHours,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,metadata,profile,relationshipData,moreHours,serviceItems',
            auth: auth
        });
        return response.data;
    } catch (error) {
        console.error('Error getting location details:', error);
        throw error;
    }
};

const deleteLocation = async (auth, locationId) => {
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation('v1');
    try {
        await mybusinessbusinessinformation.locations.delete({
            name: `locations/${locationId}`,  // Ensure this format
            auth: auth
        });
    } catch (error) {
        console.error('Error deleting location:', error);
        throw error;
    }
};

const getVerificationOptions = async (auth, locationId) => {
    const mybusinessverifications = google.mybusinessverifications('v1');
    try {
        const response = await mybusinessverifications.locations.fetchVerificationOptions({
            location: `locations/${locationId}`,
            languageCode: "en",
            auth: auth
        });
        return response.data.options;
    } catch (error) {
        console.error('Error getting verification options:', error);
        throw error;
    }
};

const requestVerification = async (auth, locationId) => {
    const mybusinessverifications = google.mybusinessverifications('v1');
    try {
        const response = await mybusinessverifications.locations.verify({
            name: `locations/${locationId}`,
            requestBody: {
                method: "SMS",
                languageCode: "en",
                phoneNumber: "+8801700743213"
            },
            auth: auth
        });
        return response.data;
    } catch (error) {
        console.error('Error requesting verification:', error);
        throw error;
    }
};

const pendingVerification = async (auth, locationId) => {
    const mybusinessverifications = google.mybusinessverifications('v1');
    try {
        const response = await mybusinessverifications.locations.verifications.list({
            parent: `locations/${locationId}`,
            auth: auth
        });
        return response.data;
    } catch (error) {
        console.error('Error requesting verification:', error);
        throw error;
    }
};

const completeVerification = async (auth, verify, pin) => {
    const mybusinessverifications = google.mybusinessverifications('v1');
    try {
        const response = await mybusinessverifications.locations.verifications.complete({
            name: `${verify}`,
            requestBody: {
                pin: pin
            },
            auth: auth
        });
        return response.data;
    } catch (error) {
        console.error('Error requesting verification:', error);
        throw error;
    }
};

const listAttributes = async (auth, locationId) => {
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation('v1');
    try {
        const response = await mybusinessbusinessinformation.attributes.list({
            // parent: `locations/${locationId}`,
            showAll: true,
            // categoryName: 'categories/"gcid:electric_vehicle_charging_station',
            languageCode: "en",
            regionCode: "US",
            pageSize: 1000,
            auth: auth,
        });
        return response.data;
    } catch (error) {
        console.error('Error listing attributes:', error);
        throw error;
    }
};

module.exports = { getAuthUrl, getAuthenticatedClient, oauth2Client, listAccounts, listCategories, listGroups, createLocationGroup, listLocations, getLocationDetails, deleteLocation, getVerificationOptions, requestVerification, pendingVerification, completeVerification, listAttributes };
