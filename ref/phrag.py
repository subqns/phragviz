import math
import itertools

class edge:
    def __init__(self,voterid,canid):
        self.voterid=voterid
        self.canid=canid

class voter:
    def __init__(self,votetuple):
        self.voterid=votetuple[0]
        self.budget=votetuple[1]
        self.edges=[edge(self.voterid,canid) for canid in votetuple[2]]

class candidate:
    def __init__(self,canid,index):
        self.canid = canid
        self.index=index

class assignment:
    def __init__(self,voterlist,candidates):
        self.voterlist=voterlist
        self.candidates=candidates
        #create edgelist here at cost O(votes size)
        self.edgelist = list(itertools.chain.from_iterable((nom.edges for nom in voterlist)))
        numvoters = len(voterlist)
        numcandidates = len(candidates)
        numedges=len(self.edgelist)
        self.voterload=[0.0 for x in range(numvoters)]
        self.edgeload = [0.0 for x in range(numedges)]
        self.edgeweight = [0.0 for x in range(numedges)]
        self.cansupport=[0.0 for x in range(numcandidates)]
        self.canelected=[False for x in range(numcandidates)]
        self.electedcandidates=set()
        self.canapproval= [0.0 for x in range(numcandidates)]
        #calculate approval here at cost O(numedges)
        for voter in voterlist:
            for edge in voter.edges:
                self.canapproval[edge.canindex] += voter.budget
        self.canscore = [0.0 for x in range(numcandidates)]
        self.canscorenumerator = [0.0 for x in range(numcandidates)]
        self.canscoredenominator = [0.0 for x in range(numcandidates)]

    def setload(self, edge,load):
        oldload=self.edgeload[edge.index]
        self.edgeload[edge.index]=load
        self.voterload[edge.voterindex] +=load-oldload

    def setweight(self,edge,weight):
        oldweight=self.edgeweight[edge.index]
        self.edgeweight[edge.index]=weight
        self.cansupport[edge.canindex] +=weight-oldweight

    def setscore(self,candidate,score):
        self.canscore[candidate.index] = score

    def loadstoweights(self):
        for voter in self.voterlist:
            for edge in voter.edges:
                if(self.voterload[voter.index] > 0.0):
                    self.setweight(edge, voter.budget * self.edgeload[edge.index] / self.voterload[voter.index])

    def weightstoloads(self):
        for edge in self.edgelist:
            self.setload(edge, self.edgeweight[edge.index]/self.cansupport[edge.canindex])

    def elect(self,candidate):
        self.canelected[candidate.index]=True
        self.electedcandidates.add(candidate)

    def unelect(self,candidate):
        self.canelected[candidate.index]=False
        self.electedcandidates.remove(candidate)

def setuplists(votelist):
    #Instead of Python's dict here, you can use anything with O(log n) addition and lookup.
    #We can also use a hashmap, by generating a random constant r and useing H(canid+r)
    #since the naive thing is obviously attackable.
    voterlist = [voter(votetuple) for votetuple in votelist]
    candidatedict=dict()
    candidatearray=list()
    numcandidates=0
    numvoters=0
    numedges=0

    #Get an array of candidates that we can reference these by index
    for nom in voterlist:
        nom.index=numvoters
        numvoters+= 1
        for edge in nom.edges:
            edge.index=numedges
            edge.voterindex=nom.index
            numedges += 1
            canid = edge.canid
            if canid in candidatedict:
                edge.candidate=candidatearray[candidatedict[canid]]
                edge.canindex=edge.candidate.index
            else:
                candidatedict[canid]=numcandidates
                newcandidate=candidate(canid,numcandidates)
                candidatearray.append(newcandidate)
                edge.candidate=newcandidate
                edge.canindex=numcandidates
                numcandidates += 1
    return(voterlist,candidatearray)


def seqPhragmén(votelist,numtoelect):
    nomlist,candidates=setuplists(votelist)
    #creating an assignment now also computes the total possible stake for each candidate
    a=assignment(nomlist,candidates)

    for round in range(numtoelect):
        for canindex in range(len(candidates)):
            if not a.canelected[canindex]:
                a.canscore[canindex]=1/a.canapproval[canindex]
        for nom in a.voterlist:
            for edge in nom.edges:
                if not a.canelected[edge.canindex]:
                    a.canscore[edge.canindex] += nom.budget * a.voterload[nom.index] / a.canapproval[edge.canindex]
        bestcandidate=0
        bestscore = 1000 #should be infinite but I'm lazy
        for canindex in range(len(candidates)):
            if not a.canelected[canindex] and a.canscore[canindex] < bestscore:
                bestscore=a.canscore[canindex]
                bestcandidate=canindex
        electedcandidate=candidates[bestcandidate]
        a.canelected[bestcandidate]=True
        #electedcandidate.electedpos=round
        a.elect(electedcandidate)
        for nom in a.voterlist:
            for edge in nom.edges:
                if edge.canindex == bestcandidate:
                    a.setload(edge,a.canscore[bestcandidate]-a.voterload[nom.index])
    a.loadstoweights()
    return a



votelist=[
    ("B",0.5,["Z"]),
    ("A",4.0,["X","Y"]),
    ("C",0.5,["Z"]),
    ("D",0.5,["Z"]),
    ("E",0.5,["Z"])]

numtoelect = 2

a=seqPhragmén(votelist,numtoelect)

for candidate in a.electedcandidates:
    print(candidate.canid," is elected with stake ",a.cansupport[candidate.index], "and score ",a.canscore[candidate.index])

for nom in a.voterlist:
    print(nom.voterid," has load ",a.voterload[nom.index], "and supported ")
    for edge in nom.edges:
        print(edge.canid," with stake ",a.edgeweight[edge.index], end=" ")
    print()
#print("Minimum support ",min([a.cansupport[candidate.index] for candidate in a.electedcandidates]))
