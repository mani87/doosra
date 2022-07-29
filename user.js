// User related APIs and stuff here

/**
 * Register a rider
 *
 * We can ask for a couple of details while registering a user
 * Name
 * Email
 * Phone No.
 *
 * Permission to track current location via GPS
 */

// Sample express app can be created
// PS - This is just dummy to demo the APIs; not exact app
const app = express();

app.post("/user/resgiter", (req, res) => {
    const {
        body: { email, phone_no, name },
    } = req;

    // create a random uuid when user is created
    const user_id = uuid();

    // suppose there is db collection called user where we can save this info
    try {
        await userDao.saveUserDetails({ user_id, name, email, phone_no });
        res.send("Successfully saved user details!");
    } catch (e) {
        res.send(`Some error occured while saving user: ${e}`);
    }
});

app.post("/rider/register", (req, res) => {
    const {
        driver: { name, email, phone_no },
        cab: { number: cab_number },
    } = req?.body;

    // create cab_id and driver_id
    const cab_id = uuid();
    const driver_id = uuid();

    try {
        await driverDao.saveDriverDetails({ driver_id, name, email, phone_no });
        await cabDao.saveCabDetails({ cab_id, cab_number });
        res.send("Successfully saved user details!");
    } catch (e) {
        res.send(`Some error occured while saving user: ${e}`);
    }
});

// API to book a ride by the user
app.post("/assign-rider", (req, res) => {
    const {
        body: {
            user: { id: user_id },
        },
    } = req;

    try {
        // defined in cab.js; Line No : 05
        const cab = getNearestCab(user_id);
        const driverDetails = `select * from Driver where cab_id = ${cab?.id}`;

        // Since now this driver cannot be assigned till the trip ends
        await driverDao.run(
            `alter table Driver set isAvailable = false where id = ${driverDetails?.id}`
        );
        res.send(
            `Driver assigned; Here are details ${JSON.stringify(driverDetails)}`
        );
    } catch (e) {
        res.send(`Something went wrong, please try again later.`);
    }
});

// this api will be present in driver's context
// can be used to toggle availability
app.post("/toggle-availability", (req, res) => {
    const {
        body: {
            driver: { id: driver_id },
        },
    } = req;

    try {
        const isActive = await driverDao.run(
            `select isActive from Driver where id = ${driver_id}`
        );

        // run this in the end
        await driverDao.run(
            `alter table Driver set isActive = ${!isActive} where id = ${driver_id}`
        );
    } catch (e) {
        res.send(`Something went wrong, please try again later.`);
    }
});

// end the trip and collect the amount
app.post("/end-trip", (req, res) => {
    const {
        body: {
            driver: { id: driver_id },
            user: { id: rider_id },
        },
    } = req;

    try {
        // end trip and collect cash
        endTrip(driver_id, rider_id);

        // this driver is now available
        await driverDao.run(
            `alter table Driver set isAvailable = true where id = ${driverDetails?.id}`
        );
    } catch (e) {
        res.send(`Something went wrong, please try again later.`);
    }
});
