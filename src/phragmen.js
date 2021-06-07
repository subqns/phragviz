class Vote {
    constructor(voter_name,can_name) {
        this.voter_name=voter_name
        this.can_name=can_name
	this.reset()
    }

    reset() {
	this.load=0
	this.weight=0
    }

    to_str() {
	return this.can_name+" ld:"+this.load+" w:"+this.weight
    }
}

class Voter {
    constructor(name,budget,votes) {
	this.name=name
        this.budget=budget
        this.votes=[]
	this.load=0
	this.conviction=1
	this.load_record=[]
	for (let can_name of votes) {
	    this.votes.push(new Vote(name,can_name))
	}
    }

    reset() {
	this.load=0
	for (let v of this.votes) {
	    v.reset()
	}
    }

    contains_vote(can_name) {
	for (let v of this.votes) {
	    if (v.can_name==can_name) {
		return true
	    }
	}
	return false
    }
    
    add_vote(vote) {
	if (!this.contains_vote(vote.can_name)) {
	    this.votes.push(vote)
	    return true;
	}
	return false
    }

    set_conviction(c) {
	this.conviction=c
	console.log(this.conviction)
    }
    
    delete_vote(vote) {
	this.votes = this.votes.filter((v) => {
	    return vote.can_name!=v.can_name ||
		vote.voter_name!=v.voter_name
	})
    }
    
    find_vote(can_name) {
	for (let vote of this.votes) {
	    if (vote.can_name == can_name) {
		return vote
	    }
	}
	return false
    }	

    to_str() {
	let str=this.name+" b:"+this.budget+", ld:"+this.load+" \n"
	for (let vote of this.votes) {
	    str+=vote.to_str()+"\n"
	}
	return str
    }
    
}

class Candidate {
    constructor(name) {
	this.name=name
	this.reset()
    }

    reset() {
	this.support=0
	this.elected=false
	this.elected_round=0
	this.approval=0
	this.score=0
	this.score_record=[]
	this.budget_proportion=0
	this.num_votes=0
	this.votes_proportion=0
    }

    to_str() {
	return this.name+" apr: "+this.approval+"("+this.budget_proportion+") votes:"+this.num_votes+"("+this.votes_proportion+") sup:"+this.support+" scr:"+this.score+" elected:"+this.elected
    }
}

class Assignment {
    constructor(voters,candidates) {
	this.init(voters,candidates)
    }

    init(voters,candidates) {
	this.voters=voters
	this.candidates=candidates
    }

    clear() {
	this.voters=[]
	this.candidates=[]
    }
    
    run() {
	for (let c of this.candidates) { c.reset() }
	for (let v of this.voters) { v.reset() }

	this.total_budget=0
	this.total_votes=0
	for (let voter of this.voters) {
	    for (let vote of voter.votes) {
		let candidate = this.find_candidate(vote.can_name)
		if (candidate!=false) {
		    candidate.approval+=voter.budget*voter.conviction
		    this.total_budget+=voter.budget*voter.conviction
		    candidate.num_votes+=1
		    this.total_votes+=1
		} else {
		    console.log("vote for candidate "+vote.can_name+" candidate does not exist")
		}
	    }
	}
	for (let candidate of this.candidates) {
	    candidate.budget_proportion=candidate.approval/this.total_budget
	    candidate.votes_proportion=candidate.num_votes/this.total_votes
	}

    }

    add_candidate(candidate) {
	this.candidates.push(candidate)
    }

    add_voter(voter) {
	this.voters.push(voter)
    }

    add_vote(vote) {
	for (let voter of this.voters) {
	    if (voter.name==vote.voter_name) {
		return voter.add_vote(vote)
	    }
	}
	return false
    }

    delete_candidate(candidate_name) {
	this.candidates=this.candidates.filter((c) => {
	    return candidate_name != c.name
	})
	for (let voter of this.voters) {
	    voter.votes = voter.votes.filter((v) => {
		return v.can_name != candidate_name
	    })
	}
    }
    
    delete_voter(voter_name) {
	this.voters=this.voters.filter((v) => {
	    return voter_name != v.name
	})
    }
    
    delete_vote(vote) {
	for (let voter of this.voters) {
	    if (voter.name==vote.voter_name) {
		voter.delete_vote(vote)
	    }
	}
    }
    
    find_candidate(name) {
	for (let candidate of this.candidates) {
	    if (candidate.name == name) {
		return candidate
	    }
	}
	return false
    }

    find_voter(name) {
	for (let voter of this.voters) {
	    if (voter.name == name) {
		return voter
	    }
	}
	return false
    }

    set_load(voter,vote,load) {	
	let old_load = vote.load
	vote.load = load
	voter.load += load-old_load
    }

    set_weight(vote,weight) {
        let oldweight=vote.weight
        vote.weight=weight
	let can = this.find_candidate(vote.can_name)
	can.support += weight-oldweight
    }

    loads_to_weights() {
        for (let voter of this.voters) {
            for (let vote of voter.votes) {
		if (voter.load > 0.0) {
		    let weight=(voter.budget*voter.conviction)*vote.load/voter.load
                    this.set_weight(vote,weight)
		}
	    }
	}
    }

    to_str() {
	let str="candidates:\n"
	for (let candidate of this.candidates) {
	    str+=candidate.to_str()+"\n"
	}
	str+="voters:\n"
	for (let voter of this.voters) {
	    str+=voter.to_str()+"\n"
	}
	return str
    }
}

const seq_phragmen = (assignment,num_to_elect) => {
    // clear load/score records - for viewing only
    for (let voter of assignment.voters) {
	voter.load_record=[]
    }
    for (let candidate of assignment.candidates) {
	candidate.score_record=[]
    }
    for (let round=0; round<num_to_elect; round++) {
	for (let candidate of assignment.candidates) {
	    if (!candidate.elected) {
		candidate.score=1/candidate.approval
	    }
	}
	for (let voter of assignment.voters) {
	    for (let vote of voter.votes) {		
		let candidate = assignment.find_candidate(vote.can_name)
		// assume it exists...
		if (!candidate.elected) {
		    // voter load is zero first time around
		    candidate.score+=(voter.budget*voter.conviction)*voter.load/candidate.approval	    
		}
	    }
	}

	for (let candidate of assignment.candidates) {
	    if (!candidate.elected) {
		candidate.score_record.push(candidate.score)
	    }
	}
	
	let elected_candidate=false
	let best_score=10000000
	for (let candidate of assignment.candidates) {
	    if (!candidate.elected && candidate.score<best_score) {
		best_score=candidate.score
		elected_candidate=candidate
	    }
	}

	if (elected_candidate) {
	    elected_candidate.elected=true
	    elected_candidate.elected_round=round+1
	    for (let voter of assignment.voters) {
		for (let vote of voter.votes) {
		    if (vote.can_name==elected_candidate.name) {
			assignment.set_load(voter,vote,elected_candidate.score-voter.load)
		    }
		}
		voter.load_record.push(voter.load)
	    }
	}
    }

    assignment.loads_to_weights()
    return assignment    
}

export { Vote,Voter,Candidate,Assignment,seq_phragmen }
