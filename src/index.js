const $ = require("jquery")
const mousedrag = require("./mousedrag.js")
const phragmen = require("./phragmen.js")

class ElectionWidget {    
    constructor(election_id) {
	this.id=election_id+"_"
	this.state = new phragmen.Assignment([],[])
	this.voter_count = 0
	this.candidate_count = 0
    }

    clear() {
	$('#'+this.id+'voters').empty()
	$('#'+this.id+'candidates').empty()
	this.state.clear()
    }

    make_voter_name() { 
	this.voter_count+=1
	return "voter_"+this.voter_count
    }

    make_candidate_name() { 
	this.candidate_count+=1
	return "c_"+this.candidate_count
    }

    make_circle(r,text) {
	return `<svg width="80" height="80">
		<circle cx="50%" cy="50%" r="40" fill="#000" />
		<circle cx="50%" cy="50%" r="`+r*40+`" fill="#e6007a" />
                <text x="50%" y="50%" text-anchor="middle" fill="#fff" dy=".3em">`+text+`</text>
	      </svg>`;
    }

    make_delete_button(name) {
	return "<button id='"+this.id+name+"_delete' class='delete-button'>x</button>"
    }

    make_new_vote_select(name) {
	return $('<select>')
	    .attr('id',this.id+name+"_new_vote")
	    .attr('name',name+"_new_vote")
    }

    refill_vote_select(name) {
	let v = $("#"+this.id+name+"_new_vote")
	v.empty()
	v.append($('<option>').html("add"))
	for (let candidate of this.state.candidates) {
	    v.append($('<option>')
		     .attr('value',candidate.name)
		     .html(candidate.name))
	}
    }

    new_candidate() {
	this.new_candidate_with_name(this.make_candidate_name())
    }

    new_candidate_with_name(name) {
	let c = new phragmen.Candidate(name) 
	this.state.add_candidate(c)
	$("#"+this.id+"candidates")
	    .append($('<tr>')
		    .attr('id',this.id+name)
		    .append($('<td>').html(name))
		    .append($('<td>').attr('id',this.id+name+'_stakeshare'))
		    .append($('<td>').attr('id',this.id+name+'_voteshare'))
		    .append($('<td>').attr('id',this.id+name+'_elected_round'))
		    .append($('<td>').attr('id',this.id+name+'_score')
			    .attr('class','small-td'))			
		    .append($('<td>').html(this.make_delete_button(name)))
		   )

	$('#'+this.id+name+'_delete').click(() => {
	    this.state.delete_candidate(name)
	    $('#'+this.id+name).remove()
	    for (let voter of this.state.voters) {
		this.refill_vote_select(voter.name)
		$('#'+this.id+voter.name+"_vote_"+name).remove()	    
	    }
	    this.update()
	})
	
	for (let voter of this.state.voters) {
	    this.refill_vote_select(voter.name)
	}
	this.update()
	return name
    }
    
    new_vote(voter_name,can_name) {
	// check no existing	
	let vt = new phragmen.Vote(voter_name,can_name);
	this.state.add_vote(vt)
	$('#'+this.id+voter_name+'_votes')
	    .append($('<div>')
		    .attr('id',this.id+voter_name+"_vote_"+can_name)
		    .attr('class','vote')
		    .html(can_name+this.make_delete_button(voter_name+"_vote_"+can_name)))	
	this.update()
	
	$('#'+this.id+voter_name+"_vote_"+can_name+"_delete").click(() => {
	    this.state.delete_vote(vt)
	    $('#'+this.id+voter_name+"_vote_"+can_name).remove()	    	    
	    this.update()    
	})
    }
    
    new_voter() {
	this.new_voter_with_name(this.make_voter_name(),1.0)
    }
    
    new_voter_with_name(name,budget) {
	let v = new phragmen.Voter(name,budget,[])
	this.state.add_voter(v)
	$("#"+this.id+"voters")
	    .append($('<tr>')
		    .attr('id',this.id+name)
		    .append($('<td>').html(name))
		    .append($('<td>').attr('id',this.id+name+'_budget')
			    .append($('<input>')
				    .attr('id',this.id+name+'_budget_drag')
				    .attr('type','number')
				    .attr('value',v.budget.toFixed(2))))
		    .append($('<td>').attr('id',this.id+name+'_load')
			    .attr('class','small-td')
			    .html(v.load))
		    .append($('<td>')
			    .attr('class','votes-td')
			    .append($('<div>')
				    .attr('id',this.id+name+'_votes')
				    .attr('class','votes-container'))
			    .append($('<div>').append(this.make_new_vote_select(name))))
		    .append($('<td>').html(this.make_delete_button(name)))
		   )

	mousedrag.init(this.id+name+'_budget_drag')
    
	$('#'+this.id+name+'_budget_drag').change(() => {
	    v.budget = parseFloat($('#'+this.id+name+'_budget_drag').val())
	    this.update()
	})
    
	this.refill_vote_select(name)

	$('#'+this.id+name+"_delete").click(() => {
	    this.state.delete_voter(name)
	    $('#'+this.id+name).remove()
	    this.update()
	})
    
	let vote_select = $("#"+this.id+name+"_new_vote")
	vote_select.change(() => {
	    this.new_vote(name,vote_select.val())
	    vote_select.val("add")
	});

	this.update()
	return name
    }

    update() {
	let num_rounds = $('#'+this.id+'num_rounds').val()
	this.state.run()
	this.state = phragmen.seq_phragmen(this.state,num_rounds)

	for (let c of this.state.candidates) {
	    let sr=""
	    for (let s of c.score_record) {
		sr+=s.toFixed(2)+"<br>"
	    }
	    $('#'+this.id+c.name+"_score").html(sr)
	    $('#'+this.id+c.name+"_num_votes").html(c.num_votes)
	    if (c.elected) {
		$('#'+this.id+c.name+"_elected_round").html(c.elected_round)
	    } else {
		$('#'+this.id+c.name+"_elected_round").html("not elected")
	    }
	    $('#'+this.id+c.name+'_stakeshare').html(this.make_circle(c.budget_proportion,c.approval.toFixed(2)))
	    $('#'+this.id+c.name+'_voteshare').html(this.make_circle(c.votes_proportion,c.num_votes+" votes"))
	}

	for (let v of this.state.voters) {
	    let lr=""
	    for (let l of v.load_record) {
		lr+=l.toFixed(2)+" "
	    }
	    $('#'+this.id+v.name+"_load").html(lr)
	}	
    }

    // [2,["c_1","c_2","c_3"],["voter_1", 1.0, ["c_1","c_2"]],...]
    build(desc) {
	this.clear()
	let num_rounds = desc[0]
	$('#'+this.id+'num_rounds').val(num_rounds)

	// need to take a list of candidates so we
	// can include ones not voted for
	for (let can_name of desc[1]) {
	    this.new_candidate_with_name(can_name)
	    this.make_candidate_name()
	}
    
	for (let voter_arr of desc[2]) {
	    let name = voter_arr[0]
	    let budget = voter_arr[1]
	    let votes = voter_arr[2]
	    this.new_voter_with_name(name,budget)
	    this.make_voter_name()
	    for (let can_name of votes) {
		// check and add if not existing
		if (!this.state.find_candidate(can_name)) {
		    this.new_candidate_with_name(can_name)
		}
		this.new_vote(name,can_name)
	    }	
	}	
    }
}

const election = new ElectionWidget("one")

$("#one_new_candidate").click(()=>{election.new_candidate()});
$("#one_new_voter").click(()=>{election.new_voter()});
$("#one_num_rounds").change(()=>{election.update()});

$("#example_1").click(() => {
    election.build([3,
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
    election.build([3,
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
election.build([3,
		["c_1","c_2","c_3","c_4"],       
		[
		    ["voter_1", 1.0, ["c_2"]],
		    ["voter_2", 1.0, ["c_3","c_4"]],
		    ["voter_3", 1.0, ["c_2","c_4"]],
		    ["voter_4", 1.0, ["c_1","c_2"]],
		    ["voter_5", 1.0, ["c_2","c_3","c_4"]]
		]])

const election2 = new ElectionWidget("two")

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
