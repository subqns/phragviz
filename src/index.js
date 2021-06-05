const $ = require("jquery")
const election = require("./election.js")

const one = new election.Election("one",0)

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

const two = new election.Election("two",1)

$("#two_new_candidate").click(()=>{two.new_candidate()});
$("#two_new_voter").click(()=>{two.new_voter()});
$("#two_num_rounds").change(()=>{two.update()});

two.build([3,
	   ["c_1","c_2","c_3","c_4","c_5"],
	   [
	       ["voter_1", 1.0, ["c_1","c_2"]],
	       ["voter_2", 2.0, ["c_1","c_2"]],
	       ["voter_3", 3.0, ["c_1"]],
	       ["voter_4", 4.0, ["c_2","c_3","c_4"]],
	       ["voter_5", 5.0, ["c_1","c_4"]]
	   ]])

const three = new election.Election("three",2)

$("#three_new_candidate").click(()=>{three.new_candidate()});
$("#three_new_voter").click(()=>{three.new_voter()});
$("#three_num_rounds").change(()=>{three.update()});

three.build([3,
	     ["c_1","c_2","c_3","c_4","c_5"],
	     [
		 ["voter_1", 1.0, ["c_1","c_2"]],
		 ["voter_2", 2.0, ["c_1","c_2"]],
		 ["voter_3", 3.0, ["c_1"]],
		 ["voter_4", 4.0, ["c_2","c_3","c_4"]],
		 ["voter_5", 5.0, ["c_1","c_4"]]
	     ]])
