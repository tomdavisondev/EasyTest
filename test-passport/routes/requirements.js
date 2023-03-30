const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const Project = require('../models/Project');
const User = require('../models/User');
const Requirement = require('../models/Requirements');

router.post('/addrequirement', (req, res) => {
    let requirementname = req.body.requirementname;
    let requirementid = req.body.projectshorthand;
    let user = req.user;
    let name = user.name;

    let errors = [];

    if (!projectname || !projectshorthand) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (!projects) {
        Project.find({}).exec(function(err, projectlist) {
            let projects = projectlist;
        });
    }

    Project.find({}).exec(function(err, projectlist) {
        projects = projectlist;
        if (errors.length > 0) {
            console.log(errors);
            res.render('dashboard', {
                errors,
                name,
                user,
                projectname,
                projectshorthand,
                projects
            });
        } else {
            Project.findOne({projectname: { $regex: new RegExp("^" + projectname + "$", "i") }})
                .then(project => {
                    if (project) {
                        //Project exists
                        req.flash('error_msg', "Project already exists under that name")
                        res.redirect('../dashboard');
                    } else {
                        const newProject = new Project({
                            projectname,
                            projectshorthand,
                        });
                        newProject.save()
                            .then(project => {
                                req.flash('success_msg', "New project created");
                                res.redirect('../dashboard');
                            })
                            .catch(err => console.log(err));
                    }
                })
        }
    });
});


module.exports = router;