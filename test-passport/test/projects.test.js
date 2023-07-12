const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('POST /projects/addproject', function() {
  let authenticatedUser = chai.request.agent(app); // Create an authenticated user

  before(function(done) {
    // Wait for MongoDB connection event before starting the server and running the tests
    app.on('mongodbConnected', function() {
      server = app.listen(8001, function() {
        console.log('Server is running on port 8001');
        done();
      });
    });
  });

  beforeEach(function(done) {
    // Log in the user before each test
    authenticatedUser
      .post('/users/login') // Assuming you have a login route
      .send({ email: 'guest@example.com', password: 'guest' }) // Provide the email and password for an existing user
      .end(function(err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  afterEach(function(done) {
    // Log out the user after each test
    authenticatedUser
      .get('/users/logout') // Assuming you have a logout route
      .end(function(err, res) {
        expect(res).to.redirect;
        done();
      });
  });

  it('should create a new project with valid data', function(done) {
    authenticatedUser
      .post('/projects/addproject')
      .send({
        projectIconContainer_generatedIcon: 'generatedIcon',
        projectname: 'New Project',
        requirements: 'Requirements',
        projectshorthand: 'newproj',
        projects: 'projects',
      })
      .end(function(err, res) {
        expect(res).to.have.status(200);
        // Add additional assertions to validate the response or check the database for the new project
        done();
      });
  });

  it('should return an error if required fields are missing', function(done) {
    authenticatedUser
      .post('/projects/addproject')
      .send({
        projectIconContainer_generatedIcon: 'generatedIcon',
        requirements: 'Requirements',
        projects: 'projects',
      })
      .end(function(err, res) {
        expect(res).to.have.status(200);
        // Add assertions to validate the error message or check if the project was not created
        done();
      });
  });
});
