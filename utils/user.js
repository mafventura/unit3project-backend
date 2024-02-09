// import { User } from "../schema/userSchema.js";

// export async function findOrCreateUser(loggedInUser) {
//   //   console.log(loggedInUser._json);
//       try {
//         const now = new Date();
//         // find user in mongoDB
//         const existingUser = await User.find({ email: loggedInUser.email });
//         // if no user in db than create new user
//         // save new user to db
//         if (!existingUser) {
//           const newUser = new User({
//             email: loggedInUser._json.email,
//             lastLogin: now,
//             name: loggedInUser._json.name,
//           });
//           await newUser.save();
//         } else {
//           await User.findByIdAndUpdate({
//             email: loggedInUser._json.email,
//             lastLogin: now,
//             name: loggedInUser._json.name,
//           });
//         }
//       } catch (e) {
//         console.error(e);
//       }
// }


import { User } from "../schema/userSchema.js";

export async function findOrCreateUser(loggedInUser) {
    try {
        const now = new Date();

        // Find user in MongoDB
        const existingUser = await User.findOne({ email: loggedInUser._json.email });

        if (!existingUser) {
            // If no user exists, create a new user
            const newUser = new User({
                email: loggedInUser._json.email,
                lastLogin: now,
                name: loggedInUser._json.name,
            });
            // Save the new user to the database
            await newUser.save();
        } else {
            // If user exists, update the user's information
            await User.findOneAndUpdate(
                { email: loggedInUser._json.email },
                {
                    lastLogin: now,
                    name: loggedInUser._json.name,
                },
                { new: true } // This option returns the modified document
            );
        }
    } catch (e) {
        console.error(e);
    }
}
