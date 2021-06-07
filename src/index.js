const $ = require("jquery")
const election = require("./election.js")

////////////////////////////////////////////////////////////////////

const one = new election.Election("one",0)

$("#one_new_candidate").click(()=>{one.new_candidate()});
$("#one_new_voter").click(()=>{one.new_voter()});
$("#one_num_rounds").change(()=>{one.update()});

// default
one.build([3,
	   ["c1","c2","c3","c4"],       
	   [
	       ["voter1", 1.0, ["c2"]],
	       ["voter2", 1.0, ["c3","c4"]],
	       ["voter3", 1.0, ["c2","c4"]],
	       ["voter4", 1.0, ["c1","c2"]],
	       ["voter5", 1.0, ["c2","c3","c4"]]
	   ]])

////////////////////////////////////////////////////////////////////

const two = new election.Election("two",0)

$("#two_new_candidate").click(()=>{two.new_candidate()});
$("#two_new_voter").click(()=>{two.new_voter()});
$("#two_num_rounds").change(()=>{two.update()});

two.build([3,
	   ["c1","c2","c3","c4","c5"],
	   [
	       ["voter1", 1.0, ["c1","c2"]],
	       ["voter2", 2.0, ["c1","c2"]],
	       ["voter3", 3.0, ["c1"]],
	       ["voter4", 4.0, ["c2","c3","c4"]],
	       ["voter5", 5.0, ["c1","c4"]]
	   ]])

////////////////////////////////////////////////////////////////////

const three = new election.Election("three",1)

$("#three_new_candidate").click(()=>{three.new_candidate()});
$("#three_new_voter").click(()=>{three.new_voter()});
$("#three_num_rounds").change(()=>{three.update()});

three.build([2,
	     ["c1","c2","c3"],
	     [
		 ["voter1", 3.0, ["c2","c3"]],
		 ["voter2", 0.5, ["c1"]],
		 ["voter3", 0.5, ["c1"]],
		 ["voter4", 0.5, ["c1"]],
		 ["voter5", 0.5, ["c1"]]
	     ]])

////////////////////////////////////////////////////////////////////

const four = new election.Election("four",2)

$("#four_new_candidate").click(()=>{four.new_candidate()});
$("#four_new_voter").click(()=>{four.new_voter()});
$("#four_num_rounds").change(()=>{four.update()});

four.build([3,
	     ["c1","c2","c3","c4","c5"],
	     [
		 ["voter1", 1.0, ["c1","c2"]],
		 ["voter2", 2.0, ["c1","c2"]],
		 ["voter3", 3.0, ["c1"]],
		 ["voter4", 4.0, ["c2","c3","c4"]],
		 ["voter5", 5.0, ["c1","c4"]]
	     ]])


