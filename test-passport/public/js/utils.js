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

  const submenus = document.querySelectorAll('.submenu');

  function toggleSubmenu(submenu) {
	submenu.classList.toggle('open');
	const submenuItems = submenu.querySelector('.submenu-items');
	if (submenuItems) {
	  submenuItems.classList.toggle('show');
	}
  }
  
  function handleSubmenuClick(event) {
	const ignoreClicks = event.target.closest('.ignore-clicks');
	if (ignoreClicks) {
	  return;
	}
	event.preventDefault();
	const submenu = event.target.closest('.submenu');
	if (submenu) {
	  toggleSubmenu(submenu);
	}
  }
  
  function initSidebar() {
	document.addEventListener('click', handleSubmenuClick);
  }
  
  document.addEventListener('DOMContentLoaded', initSidebar);
  