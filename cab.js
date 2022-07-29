const THRESHOLD = 5; // Let us assume threshold is 5kms

// Method to find the nearest cab when user requests

function getNearestCab(user_id) {
    // with the help of GPS; we can get the current location
    const current_location = await getCurrentLocation(user_id);
    const cabs = await getAllCabs(current_location);

    return cabs[0];
}

// This can return me list of all the cabs sorted in
// ascending order of distance and that are in the
// threshold we have set + drivers that are active

async function getAllCabs(current_location) {
    const { x: userX, y: userY } = current_location;
    const requiredCabs = [];

    // this query can be run to find the cabs that are available
    const allCabs = `select cab_id from Cab where cab_id in (select cab_id from Driver where isActive = true and isAvailable = true);`;

    for (cab in allCabs) {
        const curr_cab_location = await getCurrentLocation(cab?.cab_id);
        const { x: cabX, y: cabY } = curr_cab_location;

        const distance = getDistance({ userX, userY }, { cabX, cabY });

        if (distance <= THRESHOLD) {
            requiredCabs.push(cab);
        }
    }

    return requiredCabs;
}
