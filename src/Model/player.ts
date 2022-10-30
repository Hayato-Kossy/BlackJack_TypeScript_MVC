import { Card } from "./card";
import { Table } from "./table";
import { GameDecision } from "./gameDecision";


export class Player{
    private hand:Card[];
    private bet:number;
    private winAmount:number;
    private playerScore:number;
    private gameStatus = "betting";
    private gameResult = "";
    constructor(private name:string, private type:string,private gameType:string,private chips = 400
    ){
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.chips = chips;
        this.hand = [];
        this.bet = 0;
        this.winAmount = 0;
        this.playerScore = this.getHandScore;
    }

    //NOTE戻り値のデータ型が抽象的すぎる
    public drawOne(table:Table):any{
        if(table.getDeck.isEmpty()){
            alert("No cards left. Shuffle the cards.")
            table.getDeck.pushRemainingCards(table);
            table.getDeck.shuffle();
            if(table.getGamePhase != "roundOver") return table.getDeck.getCards.pop();
            else return null;
        }
        else return table.getDeck.getCards.pop();
    }

    public promptPlayer(table:Table, userData:any):GameDecision{
        console.log("done prompt")

        let gameDecision:GameDecision = new GameDecision("", userData)
        if(table.getGamePhase === "betting") {
            if(this.type == "ai") gameDecision = this.getAiBetDecision(table);
            else gameDecision = new GameDecision("bet", userData);
        }
        else if (table.getGamePhase === "acting"){
            if(this.type === "ai") gameDecision = this.getAiGameDecision(table);
            else if(this.type === "user") gameDecision = this.getUserGameDecision(userData);
            else {gameDecision = this.getHouseGameDecision(table)
            };
        }
        return gameDecision;
    }

    public get getHandScore():number{
        let handScore = 0;
        this.hand.forEach(card=>{handScore += card.getRankNumber})
        let ace = this.countAce()
        if(handScore > 21 && this.type != "house" && ace > 0){
            while(ace > 0 && handScore > 21){
                handScore -= 10;
                ace--;
            }
        }
        return handScore;
    }

    private countAce():number{
        let count = 0;
        this.hand.forEach(card=>{if(card.getRank == "A") count++;});
        return count;
    }

    public isBlackJack(){
        if(this.getHandScore == 21 && this.hand.length == 2) return true;
        else return false;
    }

    public resetPlayerBet(){
        this.chips += this.bet;
        this.bet = 0;
    }

    public playerAllin(betCoin:number){
        this.bet += betCoin;
        this.chips -= betCoin;
    }

    //確認ずみ
    private getHouseGameDecision(table:Table):GameDecision{
        console.log("house")
        if(table.allPlayersHitCompleted() && table.allPlayersBetCompleted()){
            if(this.isBlackJack()) return new GameDecision("blackjack", this.bet);
            else if(this.getHandScore < 17) {
                return new GameDecision("hit", -1);
            }
            return new GameDecision("stand", -1);
        }
        else return new GameDecision(this.gameStatus, -1);
    }

    private getAiBetDecision(table:Table):GameDecision{
        if(table.getTurnPlayer().getGameStatus == "game over"){
            return new GameDecision("game over", 0)
        }
        else{
            let availableBet = table.getBetDenominations.filter(bet=>(bet <= this.chips));
            let betAmount = availableBet[this.randomIntInRange(0, availableBet.length)];
            table.getTurnPlayer().bet = betAmount;

            return new GameDecision("bet", betAmount);
        }
    }

    private getAiGameDecision(table:Table):GameDecision{
        let gameDecision:GameDecision = new GameDecision("",-1)
        let actionList = ["surrender", "stand", "hit", "double"];
        if(this.isBlackJack()){
            return new GameDecision("blackjack", this.bet);
        }
        else if(this.gameStatus === "bet"){
            if(gameDecision.getAction == "double" && table.getTurnPlayer().chips < table.getTurnPlayer().bet * 2){
                gameDecision.setAction = "hit";
                return new GameDecision("hit", this.bet);
            }
            else if(gameDecision.getAction == "double") table.getTurnPlayer().setBet = table.getTurnPlayer().getBet * 2;
            else return new GameDecision(actionList[this.randomIntInRange(0, actionList.length)], this.bet);
        }
        else if(this.gameStatus === "hit"){
            let actionList = ["stand", "hit"];
            return new GameDecision(actionList[this.randomIntInRange(0, actionList.length)], this.bet);
        }
        return new GameDecision(this.gameStatus, this.bet);

    }

    private getUserGameDecision(userData:any):GameDecision{
        // console.log(`${this.getType}` + `${userData}`)
        let gameDecision:GameDecision = new GameDecision("",-1);
        if(this.isBlackJack()){
            return new GameDecision("blackjack", this.bet);
        }
        else{
            return new GameDecision(userData, this.bet);
        }
    }

    public get getGameStatus():string{
        return this.gameStatus;
    }

    public set setGameStatus(gameStatus:string){
        this.gameStatus = gameStatus;
    }

    public get getHand():Card[]{
        return this.hand;
    }

    public set drawCard(card:Card){
        this.hand.push(card)
    }

    public set setHand(card:Card[]){
        this.hand = card;
    }

    public get getWinAmount():number{
        return this.winAmount;
    }

    public set setWinAmount(winAmount:number){
        this.winAmount = winAmount;
    }

    public get getPlayerScore():number{
        return this.playerScore;
    }

    public set setPlayerScore(score:number){
        this.playerScore = score;
    }

    public get getName():string{
        return this.name;
    }

    public get getType():string{
        return this.type;
    }

    public get getChips():number{
        return this.chips;
    }

    public set setChips(chips:number){
        this.chips = chips;
    }

    public get getGameResult():string{
        return this.gameResult;
    }

    public set setGameResult(gameResult:string){
        this.gameResult = gameResult;
    }

    public get getBet():number{
        return this.bet
    }

    public set setBet(bet:number){
        this.bet = bet;
    }

    public randomIntInRange(min:number, max:number){
        return Math.floor(Math.random()* (max-min) + min);
    }
}
