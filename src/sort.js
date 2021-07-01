
function sortTable(id,col) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById(id);
    switching = true;
    /* Make a loop that will continue until
       no switching has been done: */
    while (switching) {
	// Start by saying: no switching is done:
	switching = false;
	rows = table.rows;
	/* Loop through all table rows (except the
	   first, which contains table headers): */
	for (i = 0; i < (rows.length - 1); i++) {
	    // Start by saying there should be no switching:
	    shouldSwitch = false;
	    /* Get the two elements you want to compare,
	       one from current row and one from the next: */
	    x = rows[i].getElementsByTagName("TD")[col];
	    y = rows[i + 1].getElementsByTagName("TD")[col];

	    if (x.innerHTML=="not elected") {
		x = 9999
	    } else {
		x = parseFloat(x.innerHTML)
	    }
		
	    if (y.innerHTML=="not elected") {
		y = 9999
	    } else {
		y = parseFloat(y.innerHTML)
	    }
		
	    // Check if the two rows should switch place:
	    if (x > y) {
		// If so, mark as a switch and break the loop:
		shouldSwitch = true;
		break;
	    }
	}
	if (shouldSwitch) {
	    /* If a switch has been marked, make the switch
	       and mark that a switch has been done: */
	    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
	    switching = true;
	}
    }
}

export { sortTable };
