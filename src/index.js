const $ = require("jquery")
const mousedrag = require("./mousedrag.js")
const phragmen = require("./phragmen.js")

//const { uniqueNamesGenerator, animals } = require('unique-names-generator');

const state = new phragmen.Assignment([],[])

const clear = () => {
    $('#voters').empty()
    $('#candidates').empty()
    state.clear()
}

var voter_count=0

const make_voter_name = () => { 
    /*return uniqueNamesGenerator({
	dictionaries: [animals], 
    });*/
    voter_count+=1
    return "voter_"+voter_count
}

var candidate_count=0

const make_candidate_name = () => { 
    candidate_count+=1
    return "c_"+candidate_count
}

const make_circle = (r,text) => {
    return `<svg width="80" height="80">
		<circle cx="50%" cy="50%" r="40" fill="#000" />
		<circle cx="50%" cy="50%" r="`+r*40+`" fill="#e6007a" />
                <text x="50%" y="50%" text-anchor="middle" fill="#fff" dy=".3em">`+text+`</text>
	      </svg>`;
}

const make_delete_button = (name) => {
    return "<button id='"+name+"_delete' class='delete-button'>x</button>"
}

const make_new_vote_select = (name) => {
    return $('<select>')
	.attr('id',name+"_new_vote")
	.attr('name',name+"_new_vote")
}

const refill_vote_select = (name,state) => {
    let v = $("#"+name+"_new_vote")
    v.empty()
    v.append($('<option>').html("add vote"))
    for (let candidate of state.candidates) {
	v.append($('<option>')
		 .attr('value',candidate.name)
		 .html(candidate.name))
    }
}

const new_candidate = () => {
    new_candidate_with_name(make_candidate_name())
}

const new_candidate_with_name = (name) => {
    let c = new phragmen.Candidate(name) 
    state.add_candidate(c)
    $("#candidates")
	.append($('<tr>')
		.attr('id',name)
		.append($('<td>').html(name))
		.append($('<td>').attr('id',name+'_stakeshare'))
		.append($('<td>').attr('id',name+'_voteshare'))
		.append($('<td>').attr('id',name+'_elected_round'))
		.append($('<td>').attr('id',name+'_score')
			.attr('class','small-td'))			
		.append($('<td>').html(make_delete_button(name)))
	       )

    $('#'+name+'_delete').click(() => {
	state.delete_candidate(name)
	$('#'+name).remove()
	for (let voter of state.voters) {
	    refill_vote_select(voter.name,state)
	    $('#'+voter.name+"_vote_"+name).remove()	    
	}
	update(state)
    })
    
    for (let voter of state.voters) {
	refill_vote_select(voter.name,state)
    }
    update(state)
    return name
}

const new_vote = (voter_name,can_name,state) => {
    // check no existing	
    let vt = new phragmen.Vote(voter_name,can_name);
    state.add_vote(vt)
    $('#'+voter_name+'_votes')
	.append($('<div>')
		.attr('id',voter_name+"_vote_"+can_name)
		.attr('class','vote')
		.html(can_name+make_delete_button(voter_name+"_vote_"+can_name)))	
    update(state)

    $('#'+voter_name+"_vote_"+can_name+"_delete").click(() => {
	state.delete_vote(vt)
	$('#'+voter_name+"_vote_"+can_name).remove()	    	    
	update(state)    
    })
}

const new_voter = () => {
    new_voter_with_name(make_voter_name(),1.0)
}

const new_voter_with_name = (name,budget) => {
    let v = new phragmen.Voter(name,budget,[])
    state.add_voter(v)
    $("#voters")
	.append($('<tr>')
		.attr('id',name)
		.append($('<td>').html(name))
		.append($('<td>').attr('id',name+'_budget')
			.append($('<input>')
				.attr('id',name+'_budget_drag')
				.attr('type','text')
				.attr('value',v.budget.toFixed(2))))
		.append($('<td>').attr('id',name+'_load')
			.attr('class','small-td')
			.html(v.load))
		.append($('<td>')
			.attr('class','votes-td')
			.append($('<div>').attr('id',name+'_votes'))
			.append($('<div>').append(make_new_vote_select(name))))
		.append($('<td>').html(make_delete_button(name)))
	       )

    mousedrag.init(name+'_budget_drag')
    
    $('#'+name+'_budget_drag').change(() => {
	v.budget = parseFloat($('#'+name+'_budget_drag').val())
	update(state)
    })
    
    refill_vote_select(name,state)

    $('#'+name+"_delete").click(() => {
	state.delete_voter(name)
	$('#'+name).remove()
	update(state)
    })
    
    let vote_select = $("#"+name+"_new_vote")
    vote_select.change(() => {
	new_vote(name,vote_select.val(),state)
	vote_select.val("add vote")
    });

    update(state)
    return name
}

const update_rounds = () => {
    update(state)
}

const update = (state) => {
    let num_rounds = $('#num_rounds').val()
    state.run()
    state = phragmen.seq_phragmen(state,num_rounds)

    for (let c of state.candidates) {
	let sr=""
	for (let s of c.score_record) {
	    sr+=s.toFixed(2)+"<br>"
	}
	$('#'+c.name+"_score").html(sr)
	$('#'+c.name+"_num_votes").html(c.num_votes)
	if (c.elected) {
	    $('#'+c.name+"_elected_round").html(c.elected_round)
	} else {
	    $('#'+c.name+"_elected_round").html("not elected")
	}
	$('#'+c.name+'_stakeshare').html(make_circle(c.budget_proportion,c.approval.toFixed(2)))
	$('#'+c.name+'_voteshare').html(make_circle(c.votes_proportion,c.num_votes+" votes"))
    }

    for (let v of state.voters) {
	let lr=""
	for (let l of v.load_record) {
	    lr+=l.toFixed(2)+" "
	}
	$('#'+v.name+"_load").html(lr)
    }
    //console.log(state)
    //console.log(state.to_str())
}

// [2,["c_1","c_2","c_3"],["voter_1", 1.0, ["c_1","c_2"]],...]
const build = (desc) => {
    clear()

    let num_rounds = desc[0]
    $('#num_rounds').val(num_rounds)

    // need to take a list of candidates so we
    // can include ones not voted for
    for (let can_name of desc[1]) {
	new_candidate_with_name(can_name)
	make_candidate_name()
    }
    
    for (let voter_arr of desc[2]) {
	let name = voter_arr[0]
	let budget = voter_arr[1]
	let votes = voter_arr[2]
	new_voter_with_name(name,budget)
	make_voter_name()
	for (let can_name of votes) {
	    // check and add if not existing
	    if (!state.find_candidate(can_name)) {
		new_candidate_with_name(can_name)
	    }
	    new_vote(name,can_name,state)
	}	
    }

}

$("#new_candidate").click(new_candidate);
$("#new_voter").click(new_voter);
$("#num_rounds").change(update_rounds);

$("#example_1").click(() => {
    build([3,
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
    build([3,
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
build([3,
       ["c_1","c_2","c_3","c_4"],       
       [
	   ["voter_1", 1.0, ["c_2"]],
	   ["voter_2", 1.0, ["c_3","c_4"]],
	   ["voter_3", 1.0, ["c_2","c_4"]],
	   ["voter_4", 1.0, ["c_1","c_2"]],
	   ["voter_5", 1.0, ["c_2","c_3","c_4"]]
       ]])

