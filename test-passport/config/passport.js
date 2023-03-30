const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, (email, password, done) => {
            //For demo purposes only
            if(email == "guest@example.com")
            {
                const guestUser = { 
                    name: "Guest",
                    email: "guest@example.com",
                    password: "guest",
                    date: null
                }
                return done(null, guestUser);
            }
            // Match user
            User.findOne({
                    email: email
                })
                .then(user => {
                    if (!user) {
                        return done(null, false, {
                            message: 'That email is not registered'
                        });
                    }

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {
                                message: 'Password incorrect'
                            });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser(function(user, done) {
        if (user.email === "guest@example.com") {
            // Don't serialize guest users
            done(null, user);
        } else {
            done(null, user.id);
        }
    });

    passport.deserializeUser(function(id, done) {
        if (typeof id === "object" && id.email === "guest@example.com") {
            // If the id is the guest user object, return it directly
            done(null, id);
        } else {
            // Otherwise, assume id is the ObjectId of a regular user and query the database
            User.findById(id, function(err, user) {
                done(err, user);
            });
        }
    });
};