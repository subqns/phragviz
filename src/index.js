const $ = require("jquery")
const election = require("./election.js")

const one = new election.Election("one")

$("#one_new_candidate").click(()=>{one.new_candidate()});
$("#one_new_voter").click(()=>{one.new_voter()});
$("#one_num_rounds").change(()=>{one.update()});

$("#example_1").click(() => {
    one.build([3,
	       ["c_1","c_2","c_3","c_4"],
	       [
		   ["voter_1", 1.0, ["c_2"]],
		   ["voter_2", 1.0, ["c_3","c_4"]],
		   ["voter_3", 1.0, ["c_2","c_4"]],
		   ["voter_4", 1.0, ["c_1","c_2"]],
		   ["voter_5", 1.0, ["c_2","c_3","c_4"]]
	       ]])
})

$("#example_2").click(() => {
    one.build([3,
	       ["c_1","c_2","c_3","c_4","c_5"],
	       [
		   ["voter_1", 1.0, ["c_1","c_2"]],
		   ["voter_2", 2.0, ["c_1","c_2"]],
		   ["voter_3", 3.0, ["c_1"]],
		   ["voter_4", 4.0, ["c_2","c_3","c_4"]],
		   ["voter_5", 5.0, ["c_1","c_4"]]
	       ]])
})

// default
one.build([3,
	   ["c_1","c_2","c_3","c_4"],       
	   [
	       ["voter_1", 1.0, ["c_2"]],
	       ["voter_2", 1.0, ["c_3","c_4"]],
	       ["voter_3", 1.0, ["c_2","c_4"]],
	       ["voter_4", 1.0, ["c_1","c_2"]],
	       ["voter_5", 1.0, ["c_2","c_3","c_4"]]
	   ]])

const election2 = new election.Election("two")

$("#two_new_candidate").click(()=>{election2.new_candidate()});
$("#two_new_voter").click(()=>{election2.new_voter()});
$("#two_num_rounds").change(()=>{election2.update()});

election2.build([3,
		 ["c_1","c_2","c_3","c_4","c_5"],
		 [
		     ["voter_1", 1.0, ["c_1","c_2"]],
		     ["voter_2", 2.0, ["c_1","c_2"]],
		     ["voter_3", 3.0, ["c_1"]],
		     ["voter_4", 4.0, ["c_2","c_3","c_4"]],
		     ["voter_5", 5.0, ["c_1","c_4"]]
		 ]])
