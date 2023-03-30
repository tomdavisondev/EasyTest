const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const Project = require('../models/Project');
const User = require('../models/User');
const Requirement = require('../models/Requirements');

router.post('/addrequirement', (req, res) => {
    console.log(req.body.projects)
    let requirementname = req.body.requirementname;
    let requirementid = req.body.requirementid;
    let projects = req.body.projects;
    let user = req.user;
    let name = user.name;

    let errors = [];

    if (!requirementname || !requirementid) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if(!projects)
    {
        Project.find({}).exec(function(err, projects) {
        });
    }

    if (errors.length > 0) {
        console.log(errors);
        res.render('dashboard', {
            errors,
            name,
            user,
            projects,
            requirementname,
            requirementid
        });
    } else {
        Requirement.findOne({requirementname: { $regex: new RegExp("^" + requirementname + "$", "i") }})
            .then(requirement => {
                if (requirement) {
                    //Requirement exists
                    req.flash('error_msg', "Requirement already exists under that name")
                    res.redirect('../dashboard');
                } else {
                    const newRequirement = new Requirement({
                        requirementname,
                        requirementid,
                    });
                    newRequirement.save()
                        .then(requirement => {
                            req.flash('success_msg', "New requirement created");
                            res.redirect('../dashboard');
                        })
                        .catch(err => console.log(err));
                }
            })
    }
});


module.exports = router;
