export class Card
{
    private suit:string;
    private rank:string;

    constructor(suit:string, rank:string)
    {
        this.suit = suit;
        this.rank = rank;
    }

    public get getRankNumber():number{
        if(this.rank == "J" || this.rank == "Q" || this.rank == "K") return 10;
        else if(this.rank == "A") return 11;
        else return parseInt(this.rank);
    }

    public get getSuit():string{
        return this.suit;
    }

    public get getRank():string{
        return this.rank;
    }
}