function populateTestcases(testcases) {
	console.log('LOGGED')
	const parsedTestcases = JSON.parse(testcases);
	const tableBody = document.querySelector("#projects-table tbody");
	tableBody.innerHTML = "";
	parsedTestcases.forEach(function(testcase) {
	  const row = document.createElement("tr");
	  row.innerHTML = `
		<td>${testcase.name}</td>
		<td>${testcase.description}</td>
		<td>
		  ${testcase.linkedrequirements.map(function(requirement) {
			return `${requirement.requirementid}: ${requirement.requirementname}`;
		  }).join("<br>")}
		</td>
		<td>
		  <ol>
			${testcase.teststeps.map(function(step) {
			  return `
				<li>
				  <strong>Step ${step.stepnumber}:</strong>
				  <br>
				  Method: ${step.stepmethod}
				  <br>
				  Expected: ${step.stepexpected}
				  <br>
				  Actual: ${step.stepactual}
				</li>
			  `;
			}).join("")}
		  </ol>
		</td>
	  `;
	  tableBody.appendChild(row);
	});
  }