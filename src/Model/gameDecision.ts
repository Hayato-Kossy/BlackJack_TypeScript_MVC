export class GameDecision{
    private action:string;
    private amount:number;

    constructor(action:string, amount:number){
        this.action = action;
        this.amount = amount;
    }

    public get getAction():string{
        return this.action;
    }

    public get getAmount():number{
        return this.amount;
    }

    public set setAction(action:string){
        this.action = action;
    }

    public set setAmount(amount:number){
        this.amount = amount;
    }
}