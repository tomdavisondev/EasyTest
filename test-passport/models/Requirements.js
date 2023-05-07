const mongoose = require('mongoose');

const RequirementsSchema = new mongoose.Schema({
    requirementname: {
      type: String,
      required: true  
    },
    requirementid: {
        type: String, 
        required: false
    },
});

const Requirement = mongoose.model('Requirement', RequirementsSchema);

module.exports = Requirement;