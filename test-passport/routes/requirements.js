const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const Project = require('../models/Project');
const User = require('../models/User');
const Requirement = require('../models/Requirements');

router.post('/addrequirement', async (req, res) => {
    let requirementname = req.body.requirementname;
    let requirementid = req.body.requirementid;
    let projects = req.body.projects;
    let requirements = req.body.requirements;
    let user = req.user;
    let name = user.name;

    let errors = [];

    if (!requirementname || !requirementid) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (requirements === undefined) {
        try {
            requirements = await Requirement.find({}).exec();
        } catch (err) {
            console.log(err);
        }
    }
    if (projects === undefined) {
        try {
            projects = await Project.find({}).exec();
        } catch (err) {
            console.log(err);
        }
    }

    Project.find({}).exec(function (err, projectlist) {
        Requirement.find({}).exec(function (err, requirementlist) {
            if (errors.length > 0) {
                res.render('dashboard', {
                    req,
                    name,
                    errors,
                    user,
                    projects: projectlist,
                    requirements: requirementlist,
                    requirements,
                    requirementname,
                    requirementid
                });
            } else {
                Requirement.findOne({ requirementname: { $regex: new RegExp("^" + requirementname + "$", "i") } })
                    .then(requirement => {
                        if (requirement) {
                            //Requirement exists
                            req.flash('error_msg', "Requirement already exists under that name")
                            res.redirect('dashboard');
                        } else {
                            const newRequirement = new Requirement({
                                requirementname,
                                requirementid,
                            });
                            newRequirement.save()
                                .then(requirement => {
                                    req.flash('success_msg', "New requirement created");
                                    res.render('dashboard', {
                                        req,
                                        name,
                                        errors,
                                        user,
                                        projects: projectlist,
                                        requirements: requirementlist,
                                        requirementname,
                                        requirementid
                                    });
                                })
                                .catch(err => console.log(err));
                        }
                    })
            }
        });
    });
});


module.exports = router;
