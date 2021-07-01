const $ = require("jquery")
const mousedrag = require("./mousedrag.js")
const phragmen = require("./phragmen.js")
const sort = require('./sort.js')

class Election {    
    constructor(election_id,style) {
	this.style=style
	this.id=election_id+"_"
	this.state = new phragmen.Assignment([],[])
    }

    clear() {
	$('#'+this.id+'voters').empty()
	$('#'+this.id+'candidates').empty()
	this.state.clear()
    }

    make_voter_name() { 
	return "voter"+(this.state.voters.length+1)
    }

    make_candidate_name() { 
	return "c"+(this.state.candidates.length+1)
    }

    make_circle(r,text) {
	return `<svg width="80" height="80">
		<circle cx="50%" cy="50%" r="40" fill="#000" />
		<circle cx="50%" cy="50%" r="`+r*40+`" fill="#e6007a" />
                <text x="50%" y="50%" text-anchor="middle" fill="#fff" dy=".3em">`+text+`</text>
	      </svg>`;
    }

    make_2circle(r1,r2,text) {
	// r1 = no conviction could be higher or lower so...
	// if no_conviction higher than total proportion, then draw
	// total inside conviction around it
	let outer=r2
	let outer_col= "#73003d"
	let inner=r1
	let inner_col="#e6007a"
	
	// if conviction lower than total proportion, then draw
	// with conviction inside as it's smaller
	if (r1>r2) {
	    outer=r1
	    outer_col="#e6007a"
	    inner=r2
	    inner_col= "#73003d"
	}
	
	return `<svg width="80" height="80">
		<circle cx="50%" cy="50%" r="40" fill="#000" />
		<circle cx="50%" cy="50%" r="`+outer*40+`" fill="`+outer_col+`" />
		<circle cx="50%" cy="50%" r="`+inner*40+`" fill="`+inner_col+`" />
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
	this.state.add_candidate(new phragmen.Candidate(name))
	
	let el = $('<tr>')
	    .attr('id',this.id+name)
	    .append($('<td>').html(name))
	    .append($('<td>').attr('id',this.id+name+'_stakeshare'))
	    .append($('<td>').attr('id',this.id+name+'_voteshare'))
	    .append($('<td>').attr('id',this.id+name+'_elected_round'))

	if (this.style>0) {
	    el.append($('<td>').attr('id',this.id+name+'_score')
		     .attr('class','small-td'))			
	}

	el.append($('<td>').html(this.make_delete_button(name)))
	
	$("#"+this.id+"candidates").append(el)

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
	let vt = new phragmen.Vote(voter_name,can_name);
	if (this.state.add_vote(vt)) {
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
    }
    
    new_voter() {
	this.new_voter_with_name(this.make_voter_name(),1.0)
    }
    
    new_voter_with_name(name,budget) {
	let v = new phragmen.Voter(name,budget,[])
	this.state.add_voter(v)
	let el=$('<tr>')
	    .attr('id',this.id+name)
	    .append($('<td>').html(name))
	    .append($('<td>').attr('id',this.id+name+'_budget')
		    .append($('<input>')
			    .attr('id',this.id+name+'_budget_drag')
			    .attr('type','number')
			    .attr('value',v.budget.toFixed(2))
			    .change(() => {
				v.budget = parseFloat($('#'+this.id+name+'_budget_drag').val())
				this.update()
			    })))

	if (this.style>1) {
	    el.append($('<td>')
		      .append($('<select>')
			      .attr('id',this.id+name+"_conviction")
			      .attr('name',name+"_conviction")
			      .append($('<option>').html("x0.1 (no lock)").attr('value',0.1))
			      .append($('<option>').html("x1 (8 days)").attr('value',1))
			      .append($('<option>').html("x2 (16 days)").attr('value',2))
			      .append($('<option>').html("x3 (32 days)").attr('value',3))
			      .append($('<option>').html("x4 (64 days)").attr('value',4))
			      .append($('<option>').html("x5 (128 days)").attr('value',5))
			      .append($('<option>').html("x6 (256 days)").attr('value',6))
			      .val(1)
			      .change(()=>{
				  v.set_conviction(parseFloat($("#"+this.id+name+"_conviction").val()))
				  this.update()
			      })))
	    
	}
	
	if (this.style>0) {
	    el.append($('<td>').attr('id',this.id+name+'_load')
		      .attr('class','small-td')
		      .html(v.load))
	}

	el.append($('<td>')
		  .attr('class','votes-td')
		  .append($('<div>')
			  .attr('id',this.id+name+'_votes')
			  .attr('class','votes-container'))
		  .append($('<div>').append(this.make_new_vote_select(name))))
	el.append($('<td>').html(this.make_delete_button(name)))

	$("#"+this.id+"voters").append(el)
	mousedrag.init(this.id+name+'_budget_drag')	
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
		sr+=s.toFixed(3)+"<br>"
	    }
	    $('#'+this.id+c.name+"_score").html(sr)
	    $('#'+this.id+c.name+"_num_votes").html(c.num_votes)
	    if (c.elected) {
		$('#'+this.id+c.name+"_elected_round").html(c.elected_round)
	    } else {
		$('#'+this.id+c.name+"_elected_round").html("not elected")
	    }
	    if (this.style>1) {
		$('#'+this.id+c.name+'_stakeshare').html(this.make_2circle(c.budget_proportion_no_conviction,c.budget_proportion,c.approval.toFixed(2)))
	    } else {
		$('#'+this.id+c.name+'_stakeshare').html(this.make_circle(c.budget_proportion,c.approval.toFixed(2)))
	    }
	    $('#'+this.id+c.name+'_voteshare').html(this.make_circle(c.votes_proportion,c.num_votes+" votes"))
	}

	for (let v of this.state.voters) {
	    let lr=""
	    for (let l of v.load_record) {
		lr+=l.toFixed(3)+" "
	    }
	    $('#'+this.id+v.name+"_load").html(lr)
	}	
	sort.sortTable(this.id+"candidates",3)
	
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

export { Election } 
